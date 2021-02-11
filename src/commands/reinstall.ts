import path from "path";
import { PBXProject } from "xcodejs";
import { InstallArgs } from "../index";
import { readProject } from "../lib/utils";
import { install } from "./install";
import { removeScreenplayManagedTargetsAndProducts } from "./uninstall";

export async function reinstall(xcodeProjectPath: string) {
  const xcodeProject = readProject(xcodeProjectPath);

  // get details
  const installDetails = extractScreenplayReinstallDetails(
    xcodeProjectPath,
    xcodeProject
  );

  // uninstall
  removeScreenplayManagedTargetsAndProducts(xcodeProject);
  xcodeProject.writeFileSync(path.join(xcodeProjectPath, "project.pbxproj"));

  // reinstall
  await installDetails.forEach(async (installDetail) => {
    await install(installDetail);
  });
}

export function extractScreenplayReinstallDetails(
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
        workspace: settings["SCREENPLAY_WORKSPACE"]
          ? path.join(
              path.dirname(xcodeProjectPath),
              settings["SCREENPLAY_WORKSPACE"]
            )
          : settings["SCREENPLAY_WORKSPACE"],
        "with-tests": false,
        key: undefined,
        appToken: settings["SCREENPLAY_APP_KEY"],
        "with-extensions": !!settings["SCREENPLAY_EXP_EXTENSIONS"],
      };
    });
}
