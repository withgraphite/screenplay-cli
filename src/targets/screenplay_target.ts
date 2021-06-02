#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import {
  api,
  localhostApiServerWithPort,
  PROD_API_SERVER,
  request,
} from "shared-routes";
import { logError } from "splog";
import { PBXNativeTarget, PBXProject } from "xcodejs";
import { requestWithArgs } from "../lib/api";
import { getAppIcon, inferProductName, readProject } from "../lib/utils";
import { addScreenplayBuildPhase } from "../phases/build_phase";

function generateBuildPhaseScript() {
  const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${request.endpointWithArgs(
    process.env.NODE_ENV === "development"
      ? localhostApiServerWithPort(`\${NODE_PORT:-8000}`)
      : PROD_API_SERVER,
    api.scripts.buildPhaseDownloader,
    {},
    {}
  )}`;
  return `#!/bin/bash
# Learn more at "https://screenplay.dev/"
if curl -o /dev/null -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"; then
  curl -s -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}" | bash -s -- 1>&2;
  if [ 0 != $? ]; then
    echo "error: Failed to run the Screenplay script.";
    if [ "install" == $ACTION ]; then
      echo "If this is blocking release, set the SCREENPLAY_ENABLED build setting to NO to build without Screenplay.";
    fi
    exit 1;
  fi
elif [[ "YES" == $SCREENPLAY_ENABLED || ("NO" != $SCREENPLAY_ENABLED && "install" == $ACTION) ]]; then
  echo "error: Failed to download the Screenplay build script. Are you connected to the network?";
  exit 1;
fi`;
}

async function getBundleIdentifier(
  appTarget: PBXNativeTarget,
  acceptPrompts: boolean
) {
  const bundleIdentifiers = [
    ...new Set( // for uniquing
      appTarget
        .buildConfigurationList()
        .buildConfigs()
        .map((config) => config.buildSettings()["PRODUCT_BUNDLE_IDENTIFIER"])
    ),
  ];

  return bundleIdentifiers.length == 1 || acceptPrompts
    ? bundleIdentifiers[0]
    : await prompts({
        type: "select",
        name: "value",
        choices: bundleIdentifiers,
        message: `Multiple bundle identifiers found for target "${appTarget.name()}"`,
        initial: 1,
      });
}

async function checkForExistingAppSecret(
  installToken: string,
  bundleIdentifier: string,
  acceptPrompts: boolean
): Promise<string | undefined> {
  // Check to see if the app is already registered:
  const existingAppSecret = await requestWithArgs(
    api.apps.getSecret,
    {},
    {
      newAppToken: installToken,
      bundleIdentifier: bundleIdentifier,
    }
  );
  if (existingAppSecret.appSecret) {
    console.log(
      `Screenplay app already already in your org for bundle identifier "${bundleIdentifier}".`
    );
    const reinstall = acceptPrompts
      ? true
      : (
          await prompts({
            type: "confirm",
            name: "value",
            message: `Would you like to install using the existing app secret? (Recommended)`,
            initial: true,
          })
        ).value;
    if (reinstall) {
      return existingAppSecret.appSecret;
    } else {
      logError(
        `Screenplay cannot register a new app with an existing bundle identifier. Please update your target's bundle identifier and retry installing.`
      );
      process.exit(1);
    }
  }
  return undefined;
}

async function requestNewAppSecret(opts: {
  name: string;
  installToken: string;
  bundleIdentifier: string;
  icon?: string;
}) {
  const appSecretRequest = await requestWithArgs(
    api.apps.create,
    {
      name: opts.name,
      bundleIdentifier: opts.bundleIdentifier,
    },
    {},
    {
      newAppToken: opts.installToken,
    }
  );

  const appSecret = appSecretRequest.appSecret;
  const appId = appSecretRequest.id;

  if (opts.icon) {
    await requestWithArgs(
      api.apps.updateAppIcon,
      fs.readFileSync(opts.icon),
      {},
      {},
      {
        "X-SP-APP-SECRET": appSecretRequest.appSecret,
      }
    );
  }
  return { appSecret, appId };
}

async function getAppName(
  xcodeProject: PBXProject,
  target: PBXNativeTarget,
  acceptPrompts: boolean
): Promise<string | null> {
  const prompt: prompts.PromptObject<string> = {
    type: "text",
    name: "appName",
    message: "What is the name of your app?",
  };

  const inferredName = getInferredAppName(xcodeProject, target);
  if (acceptPrompts) {
    return inferredName;
  }

  if (inferredName !== null) {
    prompt.initial = inferredName;
  }

  const inputAppName = (await prompts(prompt)).appName;
  if (isValidAppName(inputAppName)) {
    return inputAppName.trim();
  }

  return null;
}

function getInferredAppName(
  xcodeProject: PBXProject,
  target: PBXNativeTarget
): string | null {
  const inferredName = inferProductName(xcodeProject, target);
  if (inferredName === null || !isValidAppName(inferredName)) {
    return null;
  }
  return inferredName;
}

function isValidAppName(name: string): boolean {
  return name !== null && name !== undefined && name.trim().length > 0;
}

export async function addScreenplayAppTarget(
  opts: {
    xcodeProjectPath: string;
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    workspacePath?: string;
    withExtensions?: boolean;
    withFromApp?: boolean;
    alwaysEnable?: boolean;
    acceptPrompts: boolean;
  } & (
    | { installToken: string; appSecret: undefined }
    | { appSecret: string; installToken: undefined }
  )
) {
  const xcodeProject = readProject(opts.xcodeProjectPath);
  const name = await getAppName(
    xcodeProject,
    opts.appTarget,
    opts.acceptPrompts
  );
  if (name === null) {
    logError("Please specify an app name!");
    process.exit(1);
  }
  let appId = null;
  const icon = getAppIcon(xcodeProject, opts.appTarget);
  const bundleIdentifier = await getBundleIdentifier(
    opts.appTarget,
    opts.acceptPrompts
  );
  // Allow for reassignment later
  let appSecret = opts.appSecret;

  // Consider the chance that this project already has this app registered.
  if (opts.installToken) {
    const existingAppSecret = await checkForExistingAppSecret(
      opts.installToken,
      bundleIdentifier,
      opts.acceptPrompts
    );
    if (existingAppSecret) {
      appSecret = existingAppSecret;
    }
  }

  // Otherwise, create a new app
  if (!appSecret && opts.installToken) {
    const newAppDetails = await requestNewAppSecret({
      icon: icon || undefined,
      name,
      bundleIdentifier,
      installToken: opts.installToken,
    });
    appId = newAppDetails.appId;
    appSecret = newAppDetails.appSecret;
  }

  // Install the details
  opts.appTarget
    .buildConfigurationList()
    .buildConfigs()
    .forEach((buildConfig) => {
      buildConfig.buildSettings()["SCREENPLAY_VERSION"] = "2";
      buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
      if (opts.workspacePath) {
        buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path.relative(
          path.dirname(opts.xcodeProjectPath),
          opts.workspacePath
        );
      }

      // Whether Screenplay is enabled
      if (buildConfig.name() === "Release" || opts.alwaysEnable) {
        buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "YES";
      } else if (buildConfig.name() === "Debug") {
        buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "NO";
      } else {
        buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "IF_ARCHIVING";
      }

      // Configurations
      if (opts.withExtensions) {
        buildConfig.buildSettings()["SCREENPLAY_EXP_EXTENSIONS"] = "YES";
      }
      if (opts.withFromApp) {
        buildConfig.buildSettings()["SCREENPLAY_EXP_FROM_APP"] = "YES";
      }
    });

  const buildPhase = addScreenplayBuildPhase(
    opts.xcodeProject,
    generateBuildPhaseScript()
  );

  opts.appTarget.addBuildPhase(buildPhase);

  return appId;
}
