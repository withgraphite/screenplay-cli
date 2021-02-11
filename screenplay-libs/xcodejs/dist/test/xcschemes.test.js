"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = __importStar(require("fs-extra"));
const mocha_1 = require("mocha");
const path = __importStar(require("path"));
const index_1 = require("../index");
const xcschemes_1 = require("../src/xcschemes");
mocha_1.describe("xcschemes", function () {
    before(() => {
        if (!fs.existsSync("test-output")) {
            fs.mkdirSync("test-output");
        }
        fs.emptyDirSync("test-output");
        fs.copySync("test/resources/Client.xcodeproj", "test-output/Client.xcodeproj");
    });
    it("Can correctly process an xcscheme", () => {
        const projectPath = "test-output/Client.xcodeproj";
        const xcodeProject = index_1.PBXProject.readFileSync(path.join(projectPath, "project.pbxproj"));
        const appTarget = xcodeProject
            .appTargets()
            .find((t) => t.name() === "Client");
        const newTargetId = xcodeProject.deepDuplicate(appTarget._id);
        const newTarget = new index_1.PBXNativeTarget(newTargetId, xcodeProject);
        newTarget.set("name", "Screenplay-Client");
        chai_1.expect(fs.existsSync("test-output/Client.xcodeproj/xcshareddata/xcschemes/Screenplay-Fennec.xcscheme")).to.be.false;
        xcschemes_1.createSchema({
            projectPath,
            srcSchemeName: "Fennec",
            srcAppTarget: appTarget,
            newBuildTarget: newTarget,
            buildableNameExtension: "app",
        });
        xcschemes_1.addTests({
            projectPath,
            appScheme: "Screenplay-Fennec",
            nativeTargetID: newTargetId,
            xcodeFileName: path.basename(projectPath),
            testTargetName: "ScreenplayUITests",
        });
        const newScheme = fs
            .readFileSync("test-output/Client.xcodeproj/xcshareddata/xcschemes/Screenplay-Fennec.xcscheme")
            .toString();
        chai_1.expect(newScheme).not.to.include("</0>");
        chai_1.expect(newScheme).to.include("Screenplay-Client");
        chai_1.expect(newScheme).to.include("ScreenplayUITests");
    });
});
//# sourceMappingURL=xcschemes.test.js.map