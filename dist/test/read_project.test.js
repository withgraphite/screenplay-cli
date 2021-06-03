"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../src/lib/utils");
describe("read_project", function () {
    const xcodeProjectPath = path_1.default.join(__dirname, "./resources/DuckDuckGo/default/DuckDuckGo.xcodeproj");
    const appTargetName = "DuckDuckGo";
    const xcodeProject = utils_1.readProject(xcodeProjectPath);
    const target = utils_1.extractTarget(xcodeProject, appTargetName);
    it("correctly infers the app name from the xcodeproj", () => {
        chai_1.expect(utils_1.inferProductName(xcodeProject, target)).to.eq("DuckDuckGo");
    });
    it("correctly infers the app icon from the xcodeproj", () => {
        chai_1.expect(utils_1.getAppIcon(xcodeProject, target)).to.eq(path_1.default.join(__dirname, "./resources/DuckDuckGo/default/DuckDuckGo/Assets.xcassets/AppIcon.appiconset/1024pt.png"));
    });
});
//# sourceMappingURL=read_project.test.js.map