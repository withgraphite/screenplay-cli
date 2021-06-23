"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const nock_1 = __importDefault(require("nock"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const xcodejs_1 = require("xcodejs");
const install_1 = require("../src/commands/install");
function stubServer() {
    nock_1.default(/.*api.screenplay.dev.*/)
        .post("/v1/new-app/FAKE_TOKEN")
        .reply(200, {
        id: "123",
        appSecret: "test_release_secret",
    });
}
describe("reinstall", function () {
    before(() => {
        stubServer();
    });
    this.timeout(60000);
    it("reinstalls correctly on blank app", () => __awaiter(this, void 0, void 0, function* () {
        const appDir = tmp_1.default.dirSync({ keep: false });
        fs_extra_1.default.copySync(path_1.default.join(__dirname, "resources/blank-objc-storyboard"), appDir.name);
        const xcodeprojDir = path_1.default.join(appDir.name, "blank-objc-storyboard.xcodeproj");
        const xcodeprojProjectDir = path_1.default.join(xcodeprojDir, "project.pbxproj");
        yield install_1.install({
            "app-target": "blank-objc-storyboard",
            "xcode-project": xcodeprojDir,
            "accept-prompts-for-ci": true,
            "with-tests": false,
            "install-token": undefined,
            "always-enable": false,
            "app-secret": "FAKE_TOKEN",
        });
        const installedProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        child_process_1.execSync(`yarn cli reinstall "${xcodeprojDir}" --app-target blank-objc-storyboard --accept-prompts-for-ci`, {
            stdio: "inherit",
        });
        const reinstalledProject = xcodejs_1.PBXProject.readFileSync(xcodeprojProjectDir);
        chai_1.expect(JSON.stringify(reinstalledProject._defn, Object.keys(reinstalledProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123")).to.deep.equal(JSON.stringify(installedProject._defn, Object.keys(installedProject._defn).sort(), 2).replace(/[A-Z0-9]{24}/g, "123"));
    }));
});
//# sourceMappingURL=reinstall.test.js.map