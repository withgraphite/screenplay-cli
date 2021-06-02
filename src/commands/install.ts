import path from "path";
import { logSuccess } from "splog";
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
    alwaysEnable: argv["always-enable"],
    acceptPrompts: argv["accept-prompts-for-ci"],
    ...(argv["install-token"]
      ? { installToken: argv["install-token"], appSecret: undefined }
      : {
          appSecret: argv["app-secret"]!,
          installToken: undefined,
        }),
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

  logSuccess("Screenplay successfully installed!");
  if (screenplayAppId) {
    console.log(
      `Visit https://screenplay.dev/app/${screenplayAppId} to view Screenplay builds & roll back`
    );
  }
}
