"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const xcodejs_1 = require("xcodejs");
describe("reinstall", function () {
    it("reinstalls correctly on blank app", (done) => {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/blank-objc-storyboard"), appDir.name);
        const xcodeprojDir = path_1.default.join(appDir.name, "blank-objc-storyboard.xcodeproj");
        const xcodeprojProjectDir = path_1.default.join(xcodeprojDir, "project.pbxproj");
        // Because the install script prompts the user to enter their app name, we need to
        // pipe in a return to pass this.
        child_process_1.execSync(`echo '\n' | yarn cli install --app-secret FAKE_TOKEN --xcode-project "${xcodeprojDir}"`, { stdio: "inherit" });
        const installedProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        child_process_1.execSync(`echo '\n' | yarn cli reinstall "${xcodeprojDir}" --app-target blank-objc-storyboard`, {
            stdio: "inherit",
        });
        const reinstalledProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        chai_1.expect(JSON.stringify(reinstalledProject._defn, Object.keys(reinstalledProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123")).to.deep.equal(JSON.stringify(installedProject._defn, Object.keys(installedProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123"));
        done();
    }).timeout(60000);
});
//# sourceMappingURL=reinstall.test.js.map