"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppIcon = exports.inferProductName = exports.extractTarget = exports.readProject = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const splog_1 = require("splog");
const xcodejs_1 = require("xcodejs");
function readProject(projectPath) {
    if (!fs_extra_1.default.existsSync(projectPath)) {
        splog_1.logError(`Could not find Xcode project ("${projectPath}").`);
        process.exit(1);
    }
    return xcodejs_1.PBXProject.readFileSync(path_1.default.join(projectPath, "project.pbxproj"));
}
exports.readProject = readProject;
function extractTarget(project, targetName, excludeScreenplayPrefixedNames) {
    let targets = project.appTargets();
    if (excludeScreenplayPrefixedNames) {
        targets = targets.filter((target) => !target.name().startsWith("Screenplay-"));
    }
    if (targets.length === 0) {
        splog_1.logError("No app targets detected in the Xcode project.");
        process.exit(1);
    }
    else if (targets.length === 1) {
        return targets[0];
    }
    else {
        if (targetName) {
            const target = targets.find((t) => {
                return t.name() === targetName;
            });
            if (target) {
                return target;
            }
        }
        splog_1.logError(`More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map((t) => {
            return `"${t.name()}"`;
        })})`);
        process.exit(1);
    }
}
exports.extractTarget = extractTarget;
/**
 * Given a native target, this method makes our best guess at the target's
 * product name. This inferred name may not be correct 100% of the time and
 * should be verified, if possible.
 */
function inferProductName(xcodeProject, target) {
    const appName = xcodeProject.extractAppName(getTargetSpecifiedBuildSettings(target), true // force extraction to expand build settings in info.plist
    );
    if (appName === "$(TARGET_NAME)") {
        return target.name();
    }
    return appName;
}
exports.inferProductName = inferProductName;
function getAppIcon(xcodeProject, target) {
    return xcodeProject.extractMarketingAppIcon(getTargetSpecifiedBuildSettings(target), target);
}
exports.getAppIcon = getAppIcon;
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
function getTargetSpecifiedBuildSettings(target) {
    return new xcodejs_1.BuildSettings(target.buildConfigurationList().defaultConfig().buildSettings());
}
//# sourceMappingURL=utils.js.map