import fs from "fs-extra";
import path from "path";
import { logError } from "splog";
import { BuildSettings, PBXNativeTarget, PBXProject } from "xcodejs";

export function readProject(projectPath: string): PBXProject {
  if (!fs.existsSync(projectPath)) {
    logError(`Could not find Xcode project ("${projectPath}").`);
    process.exit(1);
  }
  return PBXProject.readFileSync(path.join(projectPath, "project.pbxproj"));
}

export function extractTarget(
  project: PBXProject,
  targetName: string | undefined,
  excludeScreenplayPrefixedNames?: boolean
): PBXNativeTarget {
  let targets = project.appTargets();
  if (excludeScreenplayPrefixedNames) {
    targets = targets.filter(
      (target) => !target.name().startsWith("Screenplay-")
    );
  }
  if (targets.length === 0) {
    logError("No app targets detected in the Xcode project.");
    process.exit(1);
  } else if (targets.length === 1) {
    return targets[0];
  } else {
    if (targetName) {
      const target = targets.find((t) => {
        return t.name() === targetName;
      });

      if (target) {
        return target;
      }
    }

    logError(
      `More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map(
        (t) => {
          return `"${t.name()}"`;
        }
      )})`
    );
    process.exit(1);
  }
}

/**
 * Given a native target, this method makes our best guess at the target's
 * product name. This inferred name may not be correct 100% of the time and
 * should be verified, if possible.
 */
export function inferProductName(
  xcodeProject: PBXProject,
  target: PBXNativeTarget
) {
  const appName = xcodeProject.extractAppName(
    getTargetSpecifiedBuildSettings(target),
    true // force extraction to expand build settings in info.plist
  );

  if (appName === "$(TARGET_NAME)") {
    return target.name();
  }

  return appName;
}

export function getAppIcon(xcodeProject: PBXProject, target: PBXNativeTarget) {
  return xcodeProject.extractMarketingAppIcon(
    getTargetSpecifiedBuildSettings(target),
    target
  );
}

/**
 * These are ONLY the user-specified build settings on the target. Notably,
 * these settings do not include any settings set via:
 *
 *  - iOS defaults
 *  - .xcconfig files
 *  - the Xcode project
 *
 * We can improve this method in the future by making it incorporate the
 * sources above.
 */
function getTargetSpecifiedBuildSettings(target: PBXNativeTarget) {
  return new BuildSettings(
    target.buildConfigurationList().defaultConfig().buildSettings()
  );
}
