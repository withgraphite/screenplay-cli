"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugMetadata = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../lib/utils");
function debugMetadata(xcodeProjectPath, appTargetName) {
    const xcodeProject = utils_1.readProject(xcodeProjectPath);
    const target = utils_1.extractTarget(xcodeProject, appTargetName);
    const name = utils_1.inferProductName(xcodeProject, target);
    console.log(`${chalk_1.default.cyanBright("Name")}: ` + name);
    const icon = utils_1.getAppIcon(xcodeProject, target);
    console.log(`${chalk_1.default.cyanBright("Icon")}: ` + icon);
}
exports.debugMetadata = debugMetadata;
//# sourceMappingURL=debug.js.map