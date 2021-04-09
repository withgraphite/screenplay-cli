#!/usr/bin/env node
import fs from "fs-extra";
import os from "os";
import path from "path";
import {
  api,
  localhostApiServerWithPort,
  PROD_API_SERVER,
  request,
} from "shared-routes";
import {
  getBuildSettingsAndTargetNameFromTarget,
  PBXNativeTarget,
  PBXProject,
} from "xcodejs";
import { requestWithArgs } from "../lib/api";
import { error } from "../lib/utils";
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

function generateVersionBundleScript(destination: string, workspace?: string) {
  return `#!/bin/bash
if [ "NO" != $SCREENPLAY_ENABLED ]; then
  ${
    process.env.GITHUB_WORKSPACE
      ? process.env.GITHUB_WORKSPACE
      : path.join(os.homedir(), "monologue")
  }/public/build-phase/dist/build-phase.latest.pkg build-version-bundle --destination ${destination} ${
    workspace ? `--workspace "${workspace}"` : ""
  }
  fi
`;
}

export async function addScreenplayAppTarget(
  opts: {
    xcodeProjectPath: string;
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    workspacePath?: string;
    versionBundleDestination?: string;
    withExtensions?: boolean;
    withFromApp?: boolean;
    alwaysEnable?: boolean;
  } & (
    | { newAppToken: string; appToken: undefined }
    | { appToken: string; newAppToken: undefined }
  )
) {
  // Swap new app token for app secret
  const [
    buildSetting,
    returnedAppTarget,
  ] = getBuildSettingsAndTargetNameFromTarget(
    opts.xcodeProjectPath,
    opts.appTarget.name(),
    {}
  );

  if (
    opts.appTarget.name() !== returnedAppTarget ||
    opts.xcodeProject
      .rootObject()
      .targets()
      .filter((target) => {
        return target.name() === returnedAppTarget;
      }).length > 1
  ) {
    error("Error! Many targets with the same name detected");
  }

  const name = opts.xcodeProject.extractAppName(buildSetting);
  if (name === null) {
    error("Error! Could not infer name");
  }

  let appSecret = opts.appToken;
  let appId = null;

  if (opts.newAppToken) {
    const appSecretRequest = await requestWithArgs(
      api.apps.create,
      {
        name: name,
      },
      {},
      {
        newAppToken: opts.newAppToken,
      }
    );

    appSecret = appSecretRequest.appSecret;
    appId = appSecretRequest.id;

    const icon = opts.xcodeProject.extractMarketingAppIcon(
      buildSetting,
      opts.appTarget
    );
    if (icon) {
      await requestWithArgs(
        api.apps.updateAppIcon,
        fs.readFileSync(icon),
        {},
        {},
        {
          "X-SP-APP-SECRET": appSecretRequest.appSecret,
        }
      );
    }
  }

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
    opts.versionBundleDestination
      ? generateVersionBundleScript(
          opts.versionBundleDestination,
          opts.workspacePath
        )
      : generateBuildPhaseScript()
  );

  opts.appTarget.addBuildPhase(buildPhase);

  return appId;
}
