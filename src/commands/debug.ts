import chalk from "chalk";
import {
  extractTarget,
  getAppIcon,
  inferProductName,
  readProject,
} from "../lib/utils";

export function debugMetadata(xcodeProjectPath: string, appTargetName: string) {
  const xcodeProject = readProject(xcodeProjectPath);
  const target = extractTarget(xcodeProject, appTargetName);

  const name = inferProductName(xcodeProject, target);
  console.log(`${chalk.cyanBright("Name")}: ` + name);

  const icon = getAppIcon(xcodeProject, target);
  console.log(`${chalk.cyanBright("Icon")}: ` + icon);
}
