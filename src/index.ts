#! /usr/bin/env ts-node

import fs from "fs-extra";
import path from "path";
import { PBXNativeTarget, PBXProject, Utils } from "xcodejs";
import convert from "xml-js";
import yargs from "yargs";
import { error, warn } from "./utils";

const SCREENPLAY_PAYLOAD_PATH = "/tmp/screenplay/output/build-phase.pkg";

function recursivelyMutateBuildRefs(
  defn: Record<string, any>,
  buildableName: string,
  blueprintName: string,
  blueprintIdentifier: string,
  originalBlueprintIdentifier: string
) {
  Object.keys(defn).forEach((key) => {
    if (key === "_attributes" || key === "_declaration") {
      return;
    } else if (key === "BuildableReference") {
      const attributes = defn["BuildableReference"]["_attributes"];
      if (attributes["BlueprintIdentifier"] === originalBlueprintIdentifier) {
        attributes["BlueprintIdentifier"] = blueprintIdentifier;
        attributes["BuildableName"] = buildableName;
        attributes["BlueprintName"] = blueprintName;
      }
    } else {
      const value = defn[key];

      if (value instanceof Array) {
        value.forEach((innerValue: any) => {
          recursivelyMutateBuildRefs(
            innerValue,
            buildableName,
            blueprintName,
            blueprintIdentifier,
            originalBlueprintIdentifier
          );
        });
      } else if (value instanceof Object) {
        recursivelyMutateBuildRefs(
          value,
          buildableName,
          blueprintName,
          blueprintIdentifier,
          originalBlueprintIdentifier
        );
      } else {
        error("Unknown literal found in xcscheme parse");
      }
    }
  });
}

function addScreenplayBuildPhase(xcodeProject: PBXProject): string {
  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXShellScriptBuildPhase",
    buildActionMask: 2147483647,
    name: "Run Script: Generate Screenplay Project",
    runOnlyForDeploymentPostprocessing: 0,
    shellPath: "/bin/sh",
    shellScript: SCREENPLAY_PAYLOAD_PATH,
  };

  return buildPhaseId;
}

function addScreenplayBuildProduct(xcodeProject: PBXProject): string {
  const buildProductId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildProductId] = {
    isa: "PBXFileReference",
    explicitFileType: "wrapper.application",
    includeInIndex: 0,
    path: "Screenplay.app",
    sourceTree: "BUILT_PRODUCTS_DIR",
  };

  const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
  // Note: The next line isn't entirely correct, technically the product could be put ANYWHERE
  xcodeProject._defn["objects"][productRefGroupId]["children"].push(
    buildProductId
  );

  return buildProductId;
}

function addScreenplayBuildDependencyTargetProxy(
  xcodeProject: PBXProject,
  frameworkTarget: PBXNativeTarget
) {
  const buildDependencyTargetProxyId = Utils.generateUUID(
    xcodeProject.allObjectKeys()
  );
  xcodeProject._defn["objects"][buildDependencyTargetProxyId] = {
    isa: "PBXContainerItemProxy",
    containerPortal: xcodeProject.rootObject()._id,
    proxyType: 1,
    remoteGlobalIDString: frameworkTarget._id,
    remoteInfo: frameworkTarget._defn["name"],
  };

  return buildDependencyTargetProxyId;
}

function addScreenplayBuildDependency(
  xcodeProject: PBXProject,
  frameworkTarget: PBXNativeTarget,
  buildDependencyTargetProxyId: string
) {
  const buildDependencyId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildDependencyId] = {
    isa: "PBXTargetDependency",
    target: frameworkTarget._id,
    targetProxy: buildDependencyTargetProxyId,
  };

  return buildDependencyId;
}

function addScreenplayAppTarget(
  xcodeProject: PBXProject,
  frameworkTarget: PBXNativeTarget,
  appTarget: PBXNativeTarget
) {
  const buildPhaseId = addScreenplayBuildPhase(xcodeProject);
  const buildProductId = addScreenplayBuildProduct(xcodeProject);
  const buildDependencyTargetProxyId = addScreenplayBuildDependencyTargetProxy(
    xcodeProject,
    frameworkTarget
  );
  const buildDependencyId = addScreenplayBuildDependency(
    xcodeProject,
    frameworkTarget,
    buildDependencyTargetProxyId
  );

  const buildTargetId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildTargetId] = {
    isa: "PBXNativeTarget",
    // Copy over the build config list for entitlements and codesigning
    // xcode doesn't seem to mind if we share, but eventually we may want to
    // actually do a deep copy here b/c no one else seems to share build
    // config lists
    buildConfigurationList: appTarget.buildConfigurationList()._id,
    buildPhases: [buildPhaseId],
    buildRules: [],
    dependencies: [buildDependencyId],
    name: `ScreenplayApp${appTarget.name()}`,
    productName: "Screenplay",
    productReference: buildProductId,
    productType: "com.apple.product-type.application",
  };

  xcodeProject.rootObject()._defn["targets"].push(buildTargetId);

  return buildTargetId;
}

function createFrameworkTargetFromAppTarget(
  xcodeProject: PBXProject,
  appTarget: PBXNativeTarget
) {
  const frameworkTarget = xcodeProject.duplicateTargetAndBuildSettings(
    appTarget
  );

  frameworkTarget._defn[
    "name"
  ] = `ScreenplayFramework${frameworkTarget._defn["name"]}`;
  frameworkTarget._defn["productType"] = "com.apple.product-type.framework";
  frameworkTarget.product()._defn["explicitFileType"] = "wrapper.framework";

  frameworkTarget
    .buildConfigurationList()
    .buildConfigs()
    .forEach((buildConfig, index) => {
      const buildSettings = buildConfig.buildSettings();
      buildSettings["DYLIB_INSTALL_NAME_BASE"] = "@rpath";
      buildSettings["LD_RUNPATH_SEARCH_PATHS"] = [
        "$(inherited)",
        "@executable_path/Frameworks",
        "@executable_path/Frameworks/$(CONTENTS_FOLDER_PATH)/Frameworks",
      ];
      buildSettings["WRAPPER_EXTENSION"] = "v$(MARKETING_VERSION).framework";
      buildSettings[
        "PRODUCT_BUNDLE_IDENTIFIER"
      ] = `${buildSettings["PRODUCT_BUNDLE_IDENTIFIER"]}.v$(MARKETING_VERSION)`;
    });

  return frameworkTarget;
}

function extractTarget(
  targets: PBXNativeTarget[],
  targetName: string
): PBXNativeTarget {
  if (targets.length === 0) {
    error("No app targets detected in the Xcode project.");
  } else if (targets.length === 1) {
    return targets[0];
  } else {
    const target = targets.find((t) => {
      return t.name() === targetName;
    });

    if (target) {
      return target;
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

function createSchema(
  projectPath: string,
  appTarget: PBXNativeTarget,
  buildTargetId: string
) {
  const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
  if (fs.existsSync(schemesFolder)) {
    const appSchemePath = path.join(
      schemesFolder,
      appTarget.name() + ".xcscheme"
    );
    if (fs.existsSync(appSchemePath)) {
      const data = fs.readFileSync(appSchemePath);
      const defn: any = convert.xml2js(data.toString(), { compact: true });

      recursivelyMutateBuildRefs(
        defn,
        "Screenplay.app",
        "Screenplay: " + appTarget.name(),
        buildTargetId,
        appTarget._id
      );

      fs.writeFileSync(
        path.join(
          schemesFolder,
          "Screenplay: " + appTarget.name() + ".xcscheme"
        ),
        convert.js2xml(defn, { compact: true })
      );
    } else {
      warn(
        `XCSchemes found but could not find a scheme for the app target ("${appTarget.name()}")`
      );
    }
  }
}

yargs
  .command(
    "install <xcode_project>",
    "Add Screenplay to the specified Xcode project",
    (yargs) => {
      yargs.positional("xcode_project", {
        describe: "The Xcode project to install Screenplay on",
      });
      yargs.option("app_target", {
        describe: "The name of the target which builds your app",
      });
    },
    (argv) => {
      install(argv);
    }
  )
  .strict()
  .demandCommand().argv;

type argvType = {
  [argName: string]: unknown;
  _: string[];
  $0: string;
};

function install(argv: argvType) {
  const xcodeProjectPath: string = argv["xcode_project"] as string;
  const xcodeProject = readProject(xcodeProjectPath);

  const sourceAppTargetName: string = argv["app_target"] as string;

  const appTargets = xcodeProject.appTargets();
  const appTarget = extractTarget(appTargets, sourceAppTargetName);

  const frameworkTarget = createFrameworkTargetFromAppTarget(
    xcodeProject,
    appTarget
  );
  const buildTargetId = addScreenplayAppTarget(
    xcodeProject,
    frameworkTarget,
    appTarget
  );

  createSchema(xcodeProjectPath, appTarget, buildTargetId);

  // Note: For some apps (such as DuckDuckGo) the target's app icon is only
  // set if you copy the relevant files / include that XCAsset.
  //
  // While it's nice, it seems like an unnecessary build step for a small nicety
  // it's possible we'll explore this in the future

  xcodeProject.writeFileSync(path.join(xcodeProjectPath, "project.pbxproj"));
}
