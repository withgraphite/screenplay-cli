import chalk from "chalk";
import path from "path";
import { InstallArgs, InstallVersionBundleArgs } from "../index";
import { extractTarget, readProject } from "../lib/utils";
import { addScreenplayAppTarget } from "../targets/screenplay_target";
import { addTests } from "../targets/test_target";

export async function install(
  argv: InstallArgs,
  versionBundleOnlyArgs?: InstallVersionBundleArgs
) {
  const xcodeProject = readProject(argv["xcode-project"]);
  const xcodeFileName = path.basename(argv["xcode-project"]);

  const appTarget = extractTarget(xcodeProject, argv["app-target"]);

  if (versionBundleOnlyArgs) {
    // Make sure to set synthetic versions on the version bundle source target (not the new one)
    appTarget
      .buildConfigurationList()
      .buildConfigs()
      .forEach((buildConfig) => {
        buildConfig.buildSettings()["MARKETING_VERSION"] =
          versionBundleOnlyArgs["app-version"];
      });
  }

  const screenplayAppId = await addScreenplayAppTarget({
    xcodeProjectPath: argv["xcode-project"],
    xcodeProject: xcodeProject,
    appTarget: appTarget,
    newAppToken: argv["key"] as string,
    appToken: argv["appToken"] as undefined,
    workspacePath: argv["workspace"],
    withExtensions: argv["with-extensions"],
    withFromApp: argv["with-from-app"],
    alwaysEnable: argv["always-enable"],
    versionBundleDestination:
      versionBundleOnlyArgs && versionBundleOnlyArgs.destination,
  });

  if (argv["with-tests"]) {
    addTests({
      xcodeFileName,
      projectPath: argv["xcode-project"],
      workspacePath: argv["workspace"],
      xcodeProject,
      appTarget,
    });
  }

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
