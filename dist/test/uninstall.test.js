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
describe("uninstall_clears_install", function () {
    this.timeout(60000);
    it("uninstalls correctly on blank app", (done) => {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/blank-objc-storyboard"), appDir.name);
        const xcodeprojDir = path_1.default.join(appDir.name, "blank-objc-storyboard.xcodeproj");
        const xcodeprojProjectDir = path_1.default.join(xcodeprojDir, "project.pbxproj");
        const preinstallProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        // Because the install script prompts the user to enter their app name, we need to
        // pipe in a return to pass this.
        child_process_1.execSync(`echo '\n' | yarn cli install --install-token FAKE_TOKEN --xcode-project "${xcodeprojDir}"`, { stdio: "inherit" });
        child_process_1.execSync(`yarn cli uninstall "${xcodeprojDir}"`, {
            stdio: "inherit",
        });
        const postinstallProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        chai_1.expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);
        fs_extra_1.default.emptyDirSync(appDir.name);
        appDir.removeCallback();
        done();
    });
});
//# sourceMappingURL=uninstall.test.js.map