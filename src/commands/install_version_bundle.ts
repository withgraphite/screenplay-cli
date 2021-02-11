#!/usr/bin/env node
import chalk from "chalk";
import path from "path";
import { XCSchemes } from "xcodejs";
import { InstallVersionBundleArgs } from "../index";
import { determineScheme, extractTarget, readProject } from "../lib/utils";
import { addVersionBundleTarget } from "../targets/version_bundle_target";

export async function installVersionBundle(argv: InstallVersionBundleArgs) {
  const xcodeProject = readProject(argv["xcode-project"]);
  const appTarget = extractTarget(xcodeProject, argv["app-target"]);
  const porkspace = {
    project: argv["xcode-project"],
    workspace: argv["workspace"],
  };

  // Make sure to set synthetic versions on the version bundle source target (not the new one)
  appTarget
    .buildConfigurationList()
    .buildConfigs()
    .forEach((buildConfig) => {
      buildConfig.buildSettings()["MARKETING_VERSION"] = argv["app-version"];
    });
  const schemeName = determineScheme({
    appTargetName: appTarget.name(),
    porkspace: porkspace,
    schemeName: argv["app-scheme"],
  });

  const buildTarget = addVersionBundleTarget({
    porkspace: {
      project: argv["xcode-project"],
      workspace: argv["workspace"],
    },
    xcodeProject: xcodeProject,
    appTarget: appTarget,
    appScheme: schemeName,
    destination: argv.destination,
  });

  if (schemeName) {
    XCSchemes.createSchema({
      srcSchemeName: schemeName,
      projectPath: argv["xcode-project"],
      workspacePath: argv["workspace"],
      srcAppTarget: appTarget,
      newBuildTarget: buildTarget,
      buildableNameExtension: "app",
    });
  }

  xcodeProject.writeFileSync(
    path.join(argv["xcode-project"], "project.pbxproj")
  );

  console.log(chalk.cyanBright("Screenplay successfully installed!"));
}
