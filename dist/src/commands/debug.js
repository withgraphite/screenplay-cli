"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugMetadata = void 0;
const chalk_1 = __importDefault(require("chalk"));
const xcodejs_1 = require("xcodejs");
const utils_1 = require("../lib/utils");
function debugMetadata(xcodeProjectPath, appTargetName) {
    const xcodeProject = utils_1.readProject(xcodeProjectPath);
    const [buildSetting] = xcodejs_1.getBuildSettingsAndTargetNameFromTarget(xcodeProjectPath, appTargetName, {});
    const realAppTarget = xcodeProject.getTargetWithName(appTargetName);
    if (realAppTarget === null) {
        utils_1.error("Missing target: " + appTargetName);
    }
    const name = xcodeProject.extractAppName(buildSetting);
    console.log(`${chalk_1.default.cyanBright("Name")}: ` + name);
    const icon = xcodeProject.extractMarketingAppIcon(buildSetting, realAppTarget);
    console.log(`${chalk_1.default.cyanBright("Icon")}: ` + icon);
}
exports.debugMetadata = debugMetadata;
//# sourceMappingURL=debug.js.map