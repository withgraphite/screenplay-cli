#! /usr/bin/env ts-node

import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import process from "process";
import { PBXNativeTarget, PBXProject, Utils } from "xcodejs";
import convert from "xml-js";
import yargs from "yargs";

const SCREENPLAY_PAYLOAD = '"${PROJECT_DIR}"/Scripts/update_plist_info.sh\n';

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
        console.log(
          chalk.yellow("Warning! Unknown literal found in xcscheme parse")
        );
        process.exit(1);
      }
    }
  });
}

function addScreenplayBuildPhase(xcodeProject: PBXProject) {
  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXShellScriptBuildPhase",
    buildActionMask: 2147483647,
    name: "Run Script: Generate Screenplay Project",
    runOnlyForDeploymentPostprocessing: 0,
    shellPath: "/bin/sh",
    shellScript: SCREENPLAY_PAYLOAD,
  };

  return buildPhaseId;
}

function addScreenplayBuildProduct(xcodeProject: PBXProject) {
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

function addScreenplayTarget(
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
    buildConfigurationList: frameworkTarget.buildConfigurationList()._id,
    buildPhases: [buildPhaseId],
    buildRules: [],
    dependencies: [buildDependencyId],
    name: "Screenplay: " + appTarget.name(),
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

  frameworkTarget._defn["name"] =
    "[SP] " + frameworkTarget._defn["name"] + " - Framework";

  frameworkTarget._defn["productType"] = "com.apple.product-type.framework";
  frameworkTarget.product()._defn["explicitFileType"] = "wrapper.framework";

  frameworkTarget
    .buildConfigurationList()
    .buildConfigs()
    .forEach((buildConfig) => {
      const buildSettings = buildConfig.buildSettings();
      buildSettings["WRAPPER_EXTENSION"] = "framework";
    });

  return frameworkTarget;
}

function extractTarget(
  targets: PBXNativeTarget[],
  targetName: string
): PBXNativeTarget {
  if (targets.length === 0) {
    console.log(
      chalk.yellow("Error! No app targets detected in the Xcode project.")
    );
    process.exit(1);
  } else if (targets.length === 1) {
    return targets[0];
  } else {
    const target = targets.find((t) => {
      return t.name() === targetName;
    });

    if (target) {
      return target;
    }

    console.log(
      chalk.yellow(
        `Error! More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map(
          (t) => {
            return `"${t.name()}"`;
          }
        )})`
      )
    );
    process.exit(1);
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
      // Get app target
      const xcodeProjectPath: string = argv["xcode_project"] as string;
      if (!fs.existsSync(xcodeProjectPath)) {
        console.log(
          chalk.yellow(
            `Error! Could not find Xcode project ("${xcodeProjectPath}").`
          )
        );
        process.exit(1);
      }

      const xcodeProject = PBXProject.readFileSync(
        path.join(xcodeProjectPath, "project.pbxproj")
      );
      const appTargets = xcodeProject.appTargets();
      const appTarget = extractTarget(appTargets, argv["app_target"] as string);

      const frameworkTarget = createFrameworkTargetFromAppTarget(
        xcodeProject,
        appTarget
      );
      const buildTargetId = addScreenplayTarget(
        xcodeProject,
        frameworkTarget,
        appTarget
      );

      // Create scheme if need be
      const schemesFolder = path.join(
        xcodeProjectPath,
        "xcshareddata",
        "xcschemes"
      );
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
          console.log(
            chalk.yellow(
              `Warning! XCSchemes found but could not find a scheme for the app target ("${appTarget.name()}")`
            )
          );
        }
      }

      // Note: For some apps (such as DuckDuckGo) the target's app icon is only
      // set if you copy the relevant files / include that XCAsset.
      //
      // While it's nice, it seems like an unnecessary build step for a small nicety
      // it's possible we'll explore this in the future

      // Write back out
      xcodeProject.writeFileSync(
        path.join(xcodeProjectPath, "project.pbxproj")
      );
    }
  )
  .strict()
  .demandCommand().argv;
