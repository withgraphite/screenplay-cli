#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScreenplayIconPhase = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
function addScreenplayIconPhase(xcodeProjectPath, xcodeProject) {
    const iconDir = path_1.default.join(xcodeProjectPath, "../Screenplay/screenplay-icons.xcassets");
    fs_extra_1.default.mkdirpSync(iconDir);
    fs_extra_1.default.copySync(path_1.default.join(__dirname, "../../assets/screenplay-icons.xcassets"), iconDir);
    const fileId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][fileId] = {
        isa: "PBXFileReference",
        lastKnownFileType: "folder.assetcatalog",
        path: "screenplay-icons.xcassets",
        sourceTree: "<group>",
    };
    const folderId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][folderId] = {
        isa: "PBXGroup",
        children: [fileId],
        path: "Screenplay",
        sourceTree: "<group>",
    };
    xcodeProject
        .rootObject()
        .mainGroup()
        .addChild(new xcodejs_1.PBXGroup(folderId, xcodeProject));
    const buildPhaseFileId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildPhaseFileId] = {
        isa: "PBXBuildFile",
        fileRef: fileId,
    };
    const buildPhaseId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildPhaseId] = {
        isa: "PBXResourcesBuildPhase",
        buildActionMask: "2147483647",
        runOnlyForDeploymentPostprocessing: "0",
        files: [buildPhaseFileId],
    };
    return buildPhaseId;
}
exports.addScreenplayIconPhase = addScreenplayIconPhase;
//# sourceMappingURL=icon_phase.js.map