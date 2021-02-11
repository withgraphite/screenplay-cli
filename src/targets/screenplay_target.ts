#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { api } from "shared-routes";
import {
  getBuildSettingsAndTargetNameFromTarget,
  PBXBuildConfigList,
  PBXNativeTarget,
  PBXProject,
  Utils,
} from "xcodejs";
import { endpointWithArgs, requestWithArgs } from "../lib/api";
import { error } from "../lib/utils";
import { addScreenplayBuildPhase } from "../phases/build_phase";
import { addScreenplayIconPhase } from "../phases/icon_phase";
import { addScreenplayBuildProduct } from "../products/build_product";
// TODO: This feels super rickety, basically relies on knowledge of framework name and that no variables or $(...) commands are included
// Also note: I think this might be wrong - right now we pull frameworks from the bulid products dir, but we may want to first copy frameworks (codesign on copy) and THEN copy it so we have codesigning (but that assumes we won't update codesigning...)
function generateBuildPhaseScript() {
  const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${endpointWithArgs(
    api.scripts.buildPhaseDownloader,
    {},
    { appSecret: "__REPLACE_ME__" }
  ).replace("__REPLACE_ME__", "$SCREENPLAY_APP_KEY")}`;
  return [
    `curl -o /dev/null -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
    `&& curl -s "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
    `| bash -s --`,
    `1>&2`,
    `|| (echo "error: Failed to download and execute Screenplay build script." && exit 1)`,
  ].join(" ");
}

export async function addScreenplayAppTarget(
  opts: {
    xcodeProjectPath: string;
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    appScheme: string;
    workspacePath?: string;
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
        { appSecret: appSecretRequest.appSecret }
      );
    }
  }

  const assetIconPhaseId = addScreenplayIconPhase(
    opts.xcodeProjectPath,
    opts.xcodeProject
  );

  const buildPhaseId = addScreenplayBuildPhase(
    opts.xcodeProject,
    generateBuildPhaseScript()
  );

  const buildProductId = addScreenplayBuildProduct(
    opts.xcodeProject,
    opts.appTarget,
    `Screenplay-${opts.appTarget.product()._defn["path"]}`
  );

  const duplicatedBuildConfigListId = opts.xcodeProject.deepDuplicate(
    opts.appTarget.buildConfigurationList()._id
  );
  const duplicatedBuildConfigList = new PBXBuildConfigList(
    duplicatedBuildConfigListId,
    opts.xcodeProject
  );
  duplicatedBuildConfigList.buildConfigs().forEach((buildConfig) => {
    // If we embed the swift std lib, then xcode tries to use source maps to find the file we built
    // the app from (my guess is to try and determine which features to include). B/c that source file
    // doesn't exist (as it was built in intercut), we're just going to turn this off
    buildConfig.buildSettings()["ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES"] = "NO";

    // We don't need this project to generate a plist because we generate it for them as part of the
    // build phase - alterantively we could set:
    // DONT_GENERATE_INFOPLIST_FILE = YES
    // INFOPLIST_FILE = ""
    // But there is some tech debt where we use the INFOPLIST_FILE variable elsewhere (when we should
    // grab the infoplist from the framework build settings instead); until we clean that up, we can
    // take this approach instead
    buildConfig.buildSettings()["INFOPLIST_PREPROCESS"] = "NO";
    buildConfig.buildSettings()["INFOPLIST_PREFIX_HEADER"] = undefined;

    // Product names default to $(TARGET_NAME), but might be a hardcoded string. Account for both.
    if (buildConfig.buildSettings()["PRODUCT_NAME"] == "$(TARGET_NAME)") {
      buildConfig.buildSettings()[
        "PRODUCT_NAME"
      ] = `Screenplay-${opts.appTarget.name()}`;
    } else {
      buildConfig.buildSettings()["PRODUCT_NAME"] = `Screenplay-${
        buildConfig.buildSettings()["PRODUCT_NAME"]
      }`;
    }

    // For the dummy Screenplay icon we put in place
    buildConfig.buildSettings()["ASSETCATALOG_COMPILER_APPICON_NAME"] =
      "AppIcon";
    buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
    buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
    if (opts.workspacePath) {
      buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path.relative(
        path.dirname(opts.xcodeProjectPath),
        opts.workspacePath
      );
    }
  });

  const buildTargetId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildTargetId] = {
    isa: "PBXNativeTarget",
    buildConfigurationList: duplicatedBuildConfigListId,
    buildPhases: [assetIconPhaseId, buildPhaseId],
    buildRules: [],
    name: `Screenplay-${opts.appTarget.name()}`,
    productName: `Screenplay-${opts.appTarget._defn["productName"]}`,
    productReference: buildProductId,
    productType: "com.apple.product-type.application",
  };

  opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);

  return [
    appId,
    new PBXNativeTarget(buildTargetId, opts.xcodeProject),
  ] as const;
}
