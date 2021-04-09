"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTarget = exports.readProject = exports.warn = exports.error = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
function error(msg) {
    console.log(chalk_1.default.yellow(`ERROR: ${msg}`));
    process.exit(1);
}
exports.error = error;
function warn(msg) {
    console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
}
exports.warn = warn;
function readProject(projectPath) {
    if (!fs_extra_1.default.existsSync(projectPath)) {
        error(`Could not find Xcode project ("${projectPath}").`);
    }
    return xcodejs_1.PBXProject.readFileSync(path_1.default.join(projectPath, "project.pbxproj"));
}
exports.readProject = readProject;
function extractTarget(project, targetName) {
    const targets = project.appTargets();
    if (targets.length === 0) {
        error("No app targets detected in the Xcode project.");
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
        error(`More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map((t) => {
            return `"${t.name()}"`;
        })})`);
    }
}
exports.extractTarget = extractTarget;
//# sourceMappingURL=utils.js.map