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
mocha_1.describe("reinstall", function () {
    it("reinstalls correctly on blank app", (done) => {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/blank-objc-storyboard"), appDir.name);
        const xcodeprojDir = path_1.default.join(appDir.name, "blank-objc-storyboard.xcodeproj");
        const xcodeprojProjectDir = path_1.default.join(xcodeprojDir, "project.pbxproj");
        child_process_1.execSync(`yarn --cwd .. cli install --appToken FAKE_TOKEN --xcode-project "${xcodeprojDir}"`, { stdio: "inherit" });
        const installedProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        child_process_1.execSync(`yarn --cwd .. cli reinstall "${xcodeprojDir}"`, {
            stdio: "inherit",
        });
        const reinstalledProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        chai_1.expect(JSON.stringify(reinstalledProject._defn, Object.keys(reinstalledProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123")).to.deep.equal(JSON.stringify(installedProject._defn, Object.keys(installedProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123"));
        fs_extra_1.default.emptyDirSync(appDir.name);
        appDir.removeCallback();
        done();
    }).timeout(20000);
    it("reinstalls correctly on lover", (done) => {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/lover"), appDir.name);
        const preReinstall = xcodejs_1.PBXProject.readFileSync(path_1.default.join(appDir.name, "installed/lover-iphone.xcodeproj/project.pbxproj"));
        child_process_1.execSync(`yarn --cwd .. cli reinstall "${path_1.default.join(appDir.name, "installed/lover-iphone.xcodeproj")}"`, {
            stdio: "inherit",
        });
        const postReinstall = xcodejs_1.PBXProject.readFileSync(path_1.default.join(appDir.name, "installed/lover-iphone.xcodeproj/project.pbxproj"));
        chai_1.expect(JSON.stringify(postReinstall._defn, Object.keys(postReinstall._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123")).to.deep.equal(JSON.stringify(preReinstall._defn, Object.keys(preReinstall._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123"));
        fs_extra_1.default.emptyDirSync(appDir.name);
        appDir.removeCallback();
        done();
    }).timeout(10000);
});
//# sourceMappingURL=reinstall.test.js.map