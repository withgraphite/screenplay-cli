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
        name: "Run Script: Generate Screenplay Project",
        runOnlyForDeploymentPostprocessing: "0",
        shellPath: "/bin/sh",
        shellScript: shellScript,
    };
    return buildPhaseId;
}
exports.addScreenplayBuildPhase = addScreenplayBuildPhase;
//# sourceMappingURL=build_phase.js.map