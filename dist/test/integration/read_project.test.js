"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../src/lib/utils");
describe("Can infer revelant information from an app", function () {
    let unzippedPath, xcodeProjectPath, xcodeProject, target;
    before(function () {
        const zipPath = path_1.default.join(__dirname, "../resources/DuckDuckGo.zip");
        unzippedPath = path_1.default.join(__dirname, "../resources/temp");
        child_process_1.execSync(`unzip ${zipPath} -d ${unzippedPath} > /dev/null`, {
            stdio: "inherit",
        });
        xcodeProjectPath = `${unzippedPath}/DuckDuckGo/default/DuckDuckGo.xcodeproj`;
        xcodeProject = utils_1.readProject(xcodeProjectPath);
        const targetName = "DuckDuckGo";
        target = utils_1.extractTarget(xcodeProject, targetName);
    });
    it("correctly infers the app name from the xcodeproj", function () {
        chai_1.expect(utils_1.inferProductName(xcodeProject, target)).to.eq("DuckDuckGo");
    });
    it("correctly infers the app icon from the xcodeproj", function () {
        chai_1.expect(utils_1.getAppIcon(xcodeProject, target)).to.eq(`${unzippedPath}/DuckDuckGo/default/DuckDuckGo/Assets.xcassets/AppIcon.appiconset/1024pt.png`);
    });
    after(function () {
        child_process_1.execSync(`rm -rf ${unzippedPath} > /dev/null`, {
            stdio: "inherit",
        });
    });
});
//# sourceMappingURL=read_project.test.js.map