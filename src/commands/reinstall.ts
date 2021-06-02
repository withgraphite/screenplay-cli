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
      throw Error("Could not identify an existing installation of Screenplay - please use the 'install' command instead.");
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
    "install-token": undefined,
    "app-secret": settings["SCREENPLAY_APP_KEY"],
    "always-enable": false,
    "accept-prompts-for-ci": false,
  };
}
