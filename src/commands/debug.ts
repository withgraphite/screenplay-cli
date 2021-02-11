import chalk from "chalk";
import { getBuildSettingsAndTargetNameFromTarget } from "xcodejs";
import { error, readProject } from "../lib/utils";

export function debugMetadata(xcodeProjectPath: string, appTargetName: string) {
  const xcodeProject = readProject(xcodeProjectPath);

  const [buildSetting] = getBuildSettingsAndTargetNameFromTarget(
    xcodeProjectPath,
    appTargetName,
    {}
  );

  const realAppTarget = xcodeProject.getTargetWithName(appTargetName);
  if (realAppTarget === null) {
    error("Missing target: " + appTargetName);
  }

  const name = xcodeProject.extractAppName(buildSetting);
  console.log(`${chalk.cyanBright("Name")}: ` + name);

  const icon = xcodeProject.extractMarketingAppIcon(
    buildSetting,
    realAppTarget
  );
  console.log(`${chalk.cyanBright("Icon")}: ` + icon);
}
