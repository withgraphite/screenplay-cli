"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const build_settings_1 = __importDefault(require("../src/build_settings"));
mocha_1.describe("BuildSettings", function () {
    it("Can extract the correct linkFilePath", () => {
        const buildSettingsPath = "test/resources/build_settings.json";
        const buildSettings = build_settings_1.default.loadFromFile(buildSettingsPath);
        chai_1.expect(buildSettings.objectFilesDir.match(/monologue.+/)[0]).to.eq("monologue/build-phase/cache/Build/Intermediates.noindex/Screenplay-RepCounter.build/Debug-iphonesimulator/Screenplay-Framework-RepCounter.build/Objects-normal");
        chai_1.expect(buildSettings.fatFrameworkPath.match(/monologue.+/)[0]).to.eq("monologue/build-phase/cache/Build/Products/Debug-iphonesimulator/Screenplay-Framework-RepCounter.v0.2.3-1462361249717.framework/Screenplay-Framework-RepCounter.v0.2.3-1462361249717");
        chai_1.expect(buildSettings.linkTarget).to.eq("x86_64-apple-ios13.6-simulator");
    });
});
//# sourceMappingURL=build_settings.test.js.map