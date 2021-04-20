import chalk from "chalk";
import path from "path";
import { InstallArgs } from "../index";
import { extractTarget, readProject } from "../lib/utils";
import { addScreenplayAppTarget } from "../targets/screenplay_target";
import { addTests } from "../targets/test_target";

export async function install(argv: InstallArgs) {
  const xcodeProject = readProject(argv["xcode-project"]);
  const xcodeFileName = path.basename(argv["xcode-project"]);

  const appTarget = extractTarget(xcodeProject, argv["app-target"]);

  const screenplayAppId = await addScreenplayAppTarget({
    xcodeProjectPath: argv["xcode-project"],
    xcodeProject: xcodeProject,
    appTarget: appTarget,
    newAppToken: argv["key"] as string,
    appToken: argv["appToken"] as undefined,
    alwaysEnable: argv["always-enable"],
  });

  if (argv["with-tests"]) {
    addTests({
      xcodeFileName,
      projectPath: argv["xcode-project"],
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
