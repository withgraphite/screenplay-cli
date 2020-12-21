"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const mocha_1 = require("mocha");
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const xcodejs_1 = require("xcodejs");
mocha_1.describe("uninstall_clears_install", function () {
    it("uninstall_clears_install", (done) => {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/blank-objc-storyboard"), appDir.name);
        const xcodeprojDir = path_1.default.join(appDir.name, "blank-objc-storyboard.xcodeproj");
        const xcodeprojProjectDir = path_1.default.join(xcodeprojDir, "project.pbxproj");
        const preinstallProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        process.chdir(path_1.default.join(__dirname, ".."));
        child_process_1.execSync(`yarn cli install --appToken FAKE_TOKEN --xcode-project "${xcodeprojDir}"`, { stdio: "inherit" });
        child_process_1.execSync(`yarn cli uninstall "${xcodeprojDir}"`, { stdio: "inherit" });
        const postinstallProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        chai_1.expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);
        done();
    }).timeout(10000);
});
//# sourceMappingURL=uninstall.test.js.map