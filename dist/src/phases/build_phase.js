#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScreenplayBuildPhase = void 0;
const xcodejs_1 = require("xcodejs");
function addScreenplayBuildPhase(xcodeProject, shellScript) {
    const buildPhaseId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildPhaseId] = {
        isa: "PBXShellScriptBuildPhase",
        buildActionMask: "2147483647",
        name: "Screenplay",
        runOnlyForDeploymentPostprocessing: "0",
        shellPath: "/bin/sh",
        shellScript: shellScript,
        inputPaths: ["$(CODESIGNING_FOLDER_PATH)/Info.plist"],
    };
    return new xcodejs_1.PBXBuildPhase(buildPhaseId, xcodeProject);
}
exports.addScreenplayBuildPhase = addScreenplayBuildPhase;
//# sourceMappingURL=build_phase.js.map