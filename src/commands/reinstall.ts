import path from "path";
import { PBXNativeTarget, PBXProject } from "xcodejs";
import { InstallArgs } from "../index";
import { extractTarget, readProject } from "../lib/utils";
import { install } from "./install";
import { removeScreenplayManagedTargetsAndProducts } from "./uninstall";

export async function reinstall(
  xcodeProjectPath: string,
  appTargetName?: string
) {
  const xcodeProject = readProject(xcodeProjectPath);
  const appTarget = extractTarget(xcodeProject, appTargetName, true);

  // get details
  const installDetails = extractScreenplayReinstallDetails(
    xcodeProjectPath,
    xcodeProject,
    appTarget
  );

  // uninstall
  removeScreenplayManagedTargetsAndProducts(
    xcodeProjectPath,
    xcodeProject,
    appTarget
  );
  xcodeProject.writeFileSync(path.join(xcodeProjectPath, "project.pbxproj"));

  // reinstall
  await install(installDetails);
}

export function extractScreenplayReinstallDetails(
  xcodeProjectPath: string,
  xcodeProject: PBXProject,
  target: PBXNativeTarget
): InstallArgs {
  let settings = target
    .buildConfigurationList()
    .buildConfigs()[0]
    .buildSettings();

  // Check if we're in V1
  if (!settings["SCREENPLAY_APP_KEY"]) {
    const screenplayTarget = xcodeProject.appTargets().find((t) => {
      return t.name() === "Screenplay-" + target.name();
    });
    if (!screenplayTarget) {
      throw Error("Could not identify Screenplay target");
    }

    settings = screenplayTarget
      .buildConfigurationList()
      .buildConfigs()[0]
      .buildSettings();
  }

  return {
    "xcode-project": xcodeProjectPath,
    "app-target": target.name(),
    "with-tests": false,
    key: undefined,
    appToken: settings["SCREENPLAY_APP_KEY"],
    "with-extensions": !!settings["SCREENPLAY_EXP_EXTENSIONS"],
    "with-from-app": !!settings["SCREENPLAY_EXP_FROM_APP"],
    "always-enable": false,
    workspace: settings["SCREENPLAY_WORKSPACE"]
      ? path.join(
          path.dirname(xcodeProjectPath),
          settings["SCREENPLAY_WORKSPACE"]
        )
      : settings["SCREENPLAY_WORKSPACE"],
  };
}
