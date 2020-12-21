#!/usr/bin/env node
import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { api } from "shared-routes";
import {
  getBuildSettingsAndTargetNameFromTarget,
  PBXBuildConfigList,
  PBXFileReference,
  PBXGroup,
  PBXNativeTarget,
  PBXProject,
  Utils,
  XCSchemes,
} from "xcodejs";
import yargs from "yargs";
import { endpointWithArgs, requestWithArgs } from "./lib/api";
import { error } from "./utils";

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

function generateVersionBundleScript(
  scheme: string,
  destination: string,
  workspace?: string
) {
  return [
    `${
      process.env.GITHUB_WORKSPACE
        ? process.env.GITHUB_WORKSPACE
        : path.join(os.homedir(), "monologue")
    }/build-phase/dist/build-phase.pkg`,
    `build-version-bundle`,
    `--scheme ${scheme}`,
    `--destination ${destination}`,
    workspace ? `--workspace ${workspace}` : "",
  ].join(" ");
}

function addScreenplayIconPhase(
  xcodeProjectPath: string,
  xcodeProject: PBXProject
): string {
  const iconDir = path.join(
    xcodeProjectPath,
    "../Screenplay/screenplay-icons.xcassets"
  );
  fs.mkdirpSync(iconDir);
  fs.copySync(
    path.join(__dirname, "../assets/screenplay-icons.xcassets"),
    iconDir
  );

  const fileId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][fileId] = {
    isa: "PBXFileReference",
    lastKnownFileType: "folder.assetcatalog",
    path: "screenplay-icons.xcassets",
    sourceTree: "<group>",
  };

  const folderId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][folderId] = {
    isa: "PBXGroup",
    children: [fileId],
    path: "Screenplay",
    sourceTree: "<group>",
  };

  xcodeProject
    .rootObject()
    .mainGroup()
    .addChild(new PBXGroup(folderId, xcodeProject));

  const buildPhaseFileId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseFileId] = {
    isa: "PBXBuildFile",
    fileRef: fileId,
  };

  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXResourcesBuildPhase",
    buildActionMask: "2147483647",
    runOnlyForDeploymentPostprocessing: "0",
    files: [buildPhaseFileId],
  };

  return buildPhaseId;
}

function addScreenplayBuildPhase(
  xcodeProject: PBXProject,
  shellScript: string
): string {
  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXShellScriptBuildPhase",
    buildActionMask: "2147483647",
    name: "Run Script: Generate Screenplay Project",
    runOnlyForDeploymentPostprocessing: "0",
    shellPath: "/bin/sh",
    shellScript: shellScript,
  };

  return buildPhaseId;
}

function addScreenplayBuildProduct(
  xcodeProject: PBXProject,
  appTarget: PBXNativeTarget
): string {
  const buildProductId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildProductId] = {
    isa: "PBXFileReference",
    explicitFileType: "wrapper.application",
    includeInIndex: "0",
    path: `Screenplay-${appTarget.name()}.app`,
    sourceTree: "BUILT_PRODUCTS_DIR",
  };

  const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
  xcodeProject._defn["objects"][productRefGroupId]["children"].push(
    buildProductId
  );

  return buildProductId;
}

function addScreenplayVersionBundleTarget(opts: {
  xcodeProjectPath: string;
  xcodeProject: PBXProject;
  appTarget: PBXNativeTarget;
  destination: string;
  appScheme: string;
  workspacePath?: string;
}): PBXNativeTarget {
  const buildPhaseId = addScreenplayBuildPhase(
    opts.xcodeProject,
    generateVersionBundleScript(
      opts.appScheme,
      opts.destination,
      opts.workspacePath
    )
  );
  const buildProductId = addScreenplayBuildProduct(
    opts.xcodeProject,
    opts.appTarget
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

    // Some people *Cough, wikipedia, Cough* choose to overwrite this with a const - which causes problems
    // for us when we try and build the project b/c both the Wikipedia target and the Screenplay-Wikipedia
    // target produce "Wikipedia.app" and xcode needs product names to be unique in order to infer deps
    // (Otherwise if someone wants to build "Wikipedia.app" then xcode has no idea which to build)

    buildConfig.buildSettings()["PRODUCT_NAME"] = "$(TARGET_NAME)";
    buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
    buildConfig.buildSettings()["SCREENPLAY_INCLUDED_VERSIONS"] = "latest";
    if (opts.workspacePath) {
      buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = opts.workspacePath;
    }
  });

  const buildTargetId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildTargetId] = {
    isa: "PBXNativeTarget",
    buildConfigurationList: duplicatedBuildConfigListId,
    buildPhases: [buildPhaseId],
    buildRules: [],
    name: `Screenplay-${opts.appTarget.name()}`,
    productName: `Screenplay-${opts.appTarget.name()}`,
    productReference: buildProductId,
    productType: "com.apple.product-type.application",
  };

  opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);
  return new PBXNativeTarget(buildTargetId, opts.xcodeProject);
}

async function addScreenplayAppTarget(
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
    console.log("Error! Many targets with the same name detected");
    process.exit(1);
  }

  const name = opts.xcodeProject.extractAppName(buildSetting);
  if (name === null) {
    console.log("Error! Could not infer name");
    process.exit(1);
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
    opts.appTarget
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

    // Some people *Cough, wikipedia, Cough* choose to overwrite this with a const - which causes problems
    // for us when we try and build the project b/c both the Wikipedia target and the Screenplay-Wikipedia
    // target produce "Wikipedia.app" and xcode needs product names to be unique in order to infer deps
    // (Otherwise if someone wants to build "Wikipedia.app" then xcode has no idea which to build)
    buildConfig.buildSettings()["PRODUCT_NAME"] = "$(TARGET_NAME)";

    // For the dummy Screenplay icon we put in place
    buildConfig.buildSettings()["ASSETCATALOG_COMPILER_APPICON_NAME"] =
      "AppIcon";
    buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
    buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
    if (opts.workspacePath) {
      buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = opts.workspacePath;
    }
  });

  const buildTargetId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildTargetId] = {
    isa: "PBXNativeTarget",
    buildConfigurationList: duplicatedBuildConfigListId,
    buildPhases: [assetIconPhaseId, buildPhaseId],
    buildRules: [],
    name: `Screenplay-${opts.appTarget.name()}`,
    productName: `Screenplay-${opts.appTarget.name()}`,
    productReference: buildProductId,
    productType: "com.apple.product-type.application",
  };

  opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);

  return [
    appId,
    new PBXNativeTarget(buildTargetId, opts.xcodeProject),
  ] as const;
}

function removeScreenplayManagedTargetsAndProducts(xcodeProject: PBXProject) {
  xcodeProject
    .rootObject()
    .targets()
    .forEach((target) => {
      // TODO: At some point we should update this heuristic
      // (Maybe check a custom build setting or something)
      if (target.name().startsWith("Screenplay-")) {
        target
          .buildConfigurationList()
          .buildConfigs()
          .forEach((config) => {
            config.remove();
          });

        target.buildConfigurationList().remove();

        target.buildPhases().forEach((bp) => {
          bp.remove();
        });

        const product = target.product();

        const productRefGroupId = xcodeProject.rootObject()._defn[
          "productRefGroup"
        ];
        xcodeProject._defn["objects"][productRefGroupId][
          "children"
        ] = xcodeProject._defn["objects"][productRefGroupId]["children"].filter(
          (productId: string) => {
            return productId !== product._id;
          }
        );

        product.remove();

        xcodeProject.rootObject()._defn[
          "targets"
        ] = xcodeProject
          .rootObject()
          ._defn["targets"].filter((targetId: string) => {
            return targetId !== target._id;
          });
        target.remove();
      }
    });
}

function extractScreenplayReinstallDetails(
  xcodeProjectPath: string,
  xcodeProject: PBXProject
): InstallArgs[] {
  return xcodeProject
    .rootObject()
    .targets()
    .filter((target) => {
      // TODO: At some point we should update this heuristic
      // (Maybe check a custom build setting or something)
      return target.name().startsWith("Screenplay-");
    })
    .map((target) => {
      const settings = target
        .buildConfigurationList()
        .buildConfigs()[0]
        .buildSettings();

      return {
        "xcode-project": xcodeProjectPath,
        "app-target": target.name().slice("Screenplay-".length),
        "app-scheme": settings["SCREENPLAY_SCHEME"],
        workspace: settings["SCREENPLAY_WORKSPACE"],
        "with-tests": false,
        key: undefined,
        appToken: settings["SCREENPLAY_APP_KEY"],
      };
    });
}

function extractTarget(
  targets: PBXNativeTarget[],
  targetName: string | undefined
): PBXNativeTarget {
  if (targets.length === 0) {
    error("No app targets detected in the Xcode project.");
  } else if (targets.length === 1) {
    return targets[0];
  } else {
    if (targetName) {
      const target = targets.find((t) => {
        return t.name() === targetName;
      });

      if (target) {
        return target;
      }
    }

    error(
      `More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map(
        (t) => {
          return `"${t.name()}"`;
        }
      )})`
    );
  }
}

function readProject(projectPath: string): PBXProject {
  if (!fs.existsSync(projectPath)) {
    error(`Could not find Xcode project ("${projectPath}").`);
  }
  return PBXProject.readFileSync(path.join(projectPath, "project.pbxproj"));
}

function addTests(opts: {
  xcodeFileName: string;
  projectPath: string;
  xcodeProject: PBXProject;
  appTarget: PBXNativeTarget;
  appScheme: string;
}) {
  // Copy files
  const uiTestDir = path.join(opts.projectPath, "../ScreenplayUITests");
  fs.mkdirSync(uiTestDir);
  fs.copySync(path.join(__dirname, "../assets/ui_test_src"), uiTestDir);

  // Add files
  const codeSourceId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][codeSourceId] = {
    path: "ScreenplayUITests.m",
    isa: "PBXFileReference",
    lastKnownFileType: "sourcecode.c.objc",
    sourceTree: "<group>",
  };
  const plistId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][plistId] = {
    path: "Info.plist",
    isa: "PBXFileReference",
    lastKnownFileType: "text.plist.xml",
    sourceTree: "<group>",
  };

  // Add group
  const group = opts.xcodeProject.createGroup("ScreenplayUITests");
  opts.xcodeProject.rootObject().mainGroup().addChild(group);
  group.addChildren([
    new PBXFileReference(plistId, opts.xcodeProject),
    new PBXFileReference(codeSourceId, opts.xcodeProject),
  ]);

  // Add product
  const xcTestId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][xcTestId] = {
    path: "ScreenplayUITests.xctest",
    isa: "PBXFileReference",
    includeInIndex: "0",
    explicitFileType: "wrapper.cfbundle",
    sourceTree: "BUILT_PRODUCTS_DIR",
  };
  const productRefGroupId = opts.xcodeProject.rootObject()._defn[
    "productRefGroup"
  ];
  opts.xcodeProject._defn["objects"][productRefGroupId]["children"].push(
    xcTestId
  );

  // Add target
  const buildFileId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildFileId] = {
    isa: "PBXBuildFile",
    fileRef: codeSourceId,
  };

  const sourcesBuildPhaseId = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][sourcesBuildPhaseId] = {
    isa: "PBXSourcesBuildPhase",
    buildActionMask: "2147483647",
    files: [buildFileId],
    runOnlyForDeploymentPostprocessing: "0",
  };

  const testBuildConfigIds = opts.xcodeProject
    .rootObject()
    .buildConfigurationList()
    .buildConfigs()
    .map((buildConfig) => {
      const copyBuildConfigId = Utils.generateUUID(
        opts.xcodeProject.allObjectKeys()
      );
      opts.xcodeProject._defn["objects"][copyBuildConfigId] = {
        isa: "XCBuildConfiguration",
        buildSettings: {
          CLANG_MODULES_AUTOLINK: "YES",
          // without this line, we can't run the tests from the CLI
          DEVELOPMENT_TEAM: "6V5LDB8335",
          LD_RUNPATH_SEARCH_PATHS: [
            "$(inherited)",
            "@executable_path/Frameworks",
            "@loader_path/Frameworks",
          ],
          INFOPLIST_FILE: "ScreenplayUITests/Info.plist",
          CODE_SIGN_STYLE: "Automatic",
          PRODUCT_BUNDLE_IDENTIFIER: "dev.screenplay.ScreenplayUITests",
          ONLY_ACTIVE_ARCH: "false",
          TEST_TARGET_NAME: opts.appTarget.name(),
          TARGETED_DEVICE_FAMILY: "1,2",
          PRODUCT_NAME: "$(TARGET_NAME)",
          OTHER_LDFLAGS: "", // Pilleve (flutter) sets this on a project level - cancel it out for the test target.
          INFOPLIST_PREPROCESS: "NO",
          INFOPLIST_PREFIX_HEADER: "",
        },
        name: buildConfig.name(),
      };

      return copyBuildConfigId;
    });

  const buildConfigList = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildConfigList] = {
    isa: "XCConfigurationList",
    defaultConfigurationIsVisible: "0",
    defaultConfigurationName: opts.xcodeProject
      .rootObject()
      .buildConfigurationList()
      .defaultConfigurationName(),
    buildConfigurations: testBuildConfigIds,
  };

  const containerItemProxy = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][containerItemProxy] = {
    isa: "PBXContainerItemProxy",
    containerPortal: opts.xcodeProject.rootObject()._id,
    proxyType: "1",
    remoteGlobalIDString: opts.appTarget._id,
    remoteInfo: opts.appTarget.name(),
  };

  const appTargetDependency = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][appTargetDependency] = {
    isa: "PBXTargetDependency",
    target: opts.appTarget._id,
    targetProxy: containerItemProxy,
  };

  const nativeTargetID = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][nativeTargetID] = {
    buildConfigurationList: buildConfigList,
    productReference: xcTestId,
    productType: "com.apple.product-type.bundle.ui-testing",
    productName: "ScreenplayUITests",
    isa: "PBXNativeTarget",
    buildPhases: [sourcesBuildPhaseId],
    dependencies: [appTargetDependency],
    name: "ScreenplayUITests",
    buildRules: [],
  };

  opts.xcodeProject.rootObject()._defn["targets"].push(nativeTargetID);
  if (!opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"]) {
    opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"] = {};
  }
  opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"][
    nativeTargetID
  ] = {
    TestTargetID: opts.appTarget._id,
    CreatedOnToolsVersion: "12.0.1",
  };

  // Add it to the xcscheme
  XCSchemes.addTests({
    projectPath: opts.projectPath,
    appScheme: opts.appScheme,
    nativeTargetID,
    xcodeFileName: opts.xcodeFileName,
  });
}

async function installVersionBundle(argv: InstallVersionBundle) {
  const xcodeProject = readProject(argv["xcode-project"]);

  const appTarget = extractTarget(
    xcodeProject.appTargets(),
    argv["app-target"]
  );
  // Make sure to set synthetic versions on the version bundle source target (not the new one)
  appTarget
    .buildConfigurationList()
    .buildConfigs()
    .forEach((buildConfig) => {
      buildConfig.buildSettings()["MARKETING_VERSION"] = argv["app-version"];
    });
  let schemeName = argv["app-scheme"]!;

  const buildTarget = addScreenplayVersionBundleTarget({
    xcodeProjectPath: argv["xcode-project"],
    xcodeProject: xcodeProject,
    appTarget: appTarget,
    appScheme: schemeName,
    destination: argv.destination,
    workspacePath: argv["workspace"],
  });

  XCSchemes.createSchema({
    srcSchemeName: schemeName,
    projectPath: argv["xcode-project"],
    srcAppTarget: appTarget,
    newBuildTarget: buildTarget,
    buildableNameExtension: "app",
  });

  xcodeProject.writeFileSync(
    path.join(argv["xcode-project"], "project.pbxproj")
  );

  console.log(chalk.cyanBright("Screenplay successfully installed!"));
}

async function install(argv: InstallArgs) {
  const xcodeProject = readProject(argv["xcode-project"]);
  const xcodeFileName = argv["xcode-project"].split("/").slice(-1)[0];

  // To get idempotency, we simply remove and re-install
  removeScreenplayManagedTargetsAndProducts(xcodeProject);

  const appTargets = xcodeProject.appTargets();
  const appTarget = extractTarget(appTargets, argv["app-target"]);

  let schemeName = argv["app-scheme"];
  if (!schemeName) {
    schemeName = appTarget.name();
    if (!XCSchemes.schemeExists(argv["xcode-project"], schemeName)) {
      error(
        `Could not infer app scheme name, please provide it using the --app-scheme flag`
      );
    }
  }

  const [screenplayAppId, buildTarget] = await addScreenplayAppTarget({
    xcodeProjectPath: argv["xcode-project"],
    xcodeProject: xcodeProject,
    appTarget: appTarget,
    newAppToken: argv["key"] as string,
    appToken: argv["appToken"] as undefined,
    appScheme: schemeName,
    workspacePath: argv["workspace"],
  });

  const newSchemeName = XCSchemes.createSchema({
    srcSchemeName: schemeName,
    projectPath: argv["xcode-project"],
    srcAppTarget: appTarget,
    newBuildTarget: buildTarget,
    buildableNameExtension: "app",
  });

  if (argv["with-tests"]) {
    addTests({
      xcodeFileName,
      projectPath: argv["xcode-project"],
      xcodeProject,
      appTarget: buildTarget,
      appScheme: newSchemeName,
    });
  }

  // Note: For some apps (such as DuckDuckGo) the target's app icon is only
  // set if you copy the relevant files / include that XCAsset.
  //
  // While it's nice, it seems like an unnecessary build step for a small nicety
  // it's possible we'll explore this in the future
  xcodeProject.writeFileSync(
    path.join(argv["xcode-project"], "project.pbxproj")
  );

  console.log(chalk.cyanBright("Screenplay successfully installed!"));
  if (screenplayAppId) {
    console.log(
      `Visit https://screenplay.dev/app/${screenplayAppId} to manage rollbacks`
    );
  }
}

type InstallArgs = {
  "xcode-project": string;
  "app-target"?: string;
  "app-scheme"?: string;
  "app-config-name"?: string;
  workspace?: string;
  "with-tests": boolean;
} & (
  | { key: string; appToken: undefined }
  | { key: undefined; appToken: string }
);

type InstallVersionBundle = {
  "xcode-project": string;
  destination: string;
  "app-target"?: string;
  "app-scheme"?: string;
  "app-version": string;
  workspace?: string;
};

yargs
  .command(
    "install",
    "Add Screenplay to the specified Xcode project. This command requires a Screenplay app token, which can be found at https://screenplay.dev/create-app",
    (yargs) => {
      yargs
        .option("xcode-project", {
          describe: "The Xcode project to install Screenplay on",
          type: "string",
          demandOption: true,
        })
        .option("app-target", {
          describe: "The name of the target which builds your app",
          type: "string",
          demandOption: false,
        })
        .option("app-scheme", {
          describe: "The name of the scheme which builds your app",
          type: "string",
          demandOption: false,
        })
        .option("workspace", {
          describe: "The workspace you use to build the app",
          type: "string",
          default: undefined,
          demandOption: false,
        })
        .option("with-tests", {
          type: "boolean",
          describe:
            "Whether to include tests to ensure the app boots properly. This is primarily just used to debug installations and during automated tests.",
          default: false,
          demandOption: false,
        })
        .option("key", {
          type: "string",
          describe:
            "The secret key, specific to your organization, that allows you to create a new app.",
        })
        .option("appToken", {
          type: "string",
          describe:
            "An app token that's already been issued for this app (typically only used when reinstalling Screenplay on an XCode project).",
        })
        .check((argv) => {
          return (
            (argv["key"] || argv["appToken"]) &&
            !(argv["key"] && argv["appToken"])
          );
        });
    },
    (argv) => {
      return install(argv as any);
    }
  )
  .command(
    "version-bundle",
    "Add version bundle target",
    (yargs) => {
      yargs
        .option("xcode-project", {
          describe: "The Xcode project to install Screenplay on",
          type: "string",
          demandOption: true,
        })
        .option("destination", {
          describe: "Where to write the finished version bundle to",
          type: "string",
          demandOption: true,
        })
        .option("app-target", {
          describe: "The name of the target which builds your app",
          type: "string",
          demandOption: false,
        })
        .option("app-version", {
          describe: "The version to show up in the info plist",
          type: "string",
          demandOption: true,
        })
        .option("app-scheme", {
          describe: "The name of the scheme which builds your app",
          type: "string",
          demandOption: false,
        })
        .option("workspace", {
          describe: "The workspace you use to build the app",
          type: "string",
          default: undefined,
          demandOption: false,
        });
    },
    (argv) => {
      return installVersionBundle((argv as unknown) as InstallVersionBundle);
    }
  )
  .command(
    "uninstall <xcode_project>",
    "Remove Screenplay entirely from the specified xcode project",
    (yargs) => {
      yargs.positional("xcode_project", {
        describe: "The Xcode project to install Screenplay on",
      });
    },
    (argv) => {
      const xcodeProject = readProject(argv["xcode_project"] as string);
      removeScreenplayManagedTargetsAndProducts(xcodeProject);
      xcodeProject.writeFileSync(
        path.join(argv["xcode_project"] as string, "project.pbxproj")
      );

      console.log(`Screenplay has been uninstalled.`);
    }
  )
  .command(
    "reinstall <xcode_project>",
    "Reinstall Screenplay on the specified xcode project",
    (yargs) => {
      yargs.positional("xcode_project", {
        describe: "The Xcode project to install Screenplay on",
      });
    },
    (argv) => {
      const xcodeProject = readProject(argv["xcode_project"] as string);

      // get details
      const installDetails = extractScreenplayReinstallDetails(
        argv["xcode_project"] as string,
        xcodeProject
      );

      // uninstall
      removeScreenplayManagedTargetsAndProducts(xcodeProject);
      xcodeProject.writeFileSync(
        path.join(argv["xcode_project"] as string, "project.pbxproj")
      );

      // reinstall
      installDetails.forEach((installDetail) => {
        install(installDetail);
      });
    }
  )
  .command(
    "debug-metadata <xcode_project>",
    "Print the detected name and icon for an xcode project",
    (yargs) => {
      yargs.positional("xcode_project", {
        describe: "The Xcode project to install Screenplay on",
      });
      yargs.option("app-target", {
        describe: "The name of the target which builds your app",
      });
    },
    (argv) => {
      const xcodeProjectPath: string = argv["xcode_project"] as string;
      const xcodeProject = readProject(xcodeProjectPath);

      const sourceAppTargetName: string = argv["app-target"] as string;
      const appTargets = xcodeProject.appTargets();
      const appTarget = extractTarget(appTargets, sourceAppTargetName);

      const [
        buildSetting,
        appTargetName,
      ] = getBuildSettingsAndTargetNameFromTarget(
        xcodeProjectPath,
        // TODO: this isn't entirely right, we're conflating target and scheme (which may be close enough, but should prolly be cleaned up)
        appTarget.name(),
        {}
      );

      const realAppTarget = xcodeProject.getTargetWithName(appTargetName);
      if (realAppTarget === null) {
        console.log("Missing target: " + appTargetName);
        process.exit(1);
      }

      const name = xcodeProject.extractAppName(buildSetting);
      console.log(`${chalk.cyanBright("Name")}: ` + name);

      const icon = xcodeProject.extractMarketingAppIcon(
        buildSetting,
        realAppTarget
      );
      console.log(`${chalk.cyanBright("Icon")}: ` + icon);
    }
  )
  .usage(
    [
      "  ____                                 _             ",
      " / ___|  ___ _ __ ___  ___ _ __  _ __ | | __ _ _   _ ",
      " \\___ \\ / __| '__/ _ \\/ _ \\ '_ \\| '_ \\| |/ _` | | | |",
      "  ___) | (__| | |  __/  __/ | | | |_) | | (_| | |_| |",
      " |____/ \\___|_|  \\___|\\___|_| |_| .__/|_|\\__,_|\\__, |",
      "                                |_|            |___/ ",
      `Create confidently - ${chalk.cyanBright(
        "Sign up at https://screenplay.dev"
      )}`,
      "",
      "The Screenplay CLI helps you add and remove Screenplay",
      "from your xcode projects.",
    ].join("\n")
  )
  .strict()
  .demandCommand().argv;
