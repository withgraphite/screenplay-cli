#!/usr/bin/env node
import { PBXBuildPhase, PBXProject, Utils } from "xcodejs";

export function addScreenplayBuildPhase(
  xcodeProject: PBXProject,
  shellScript: string
): PBXBuildPhase {
  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXShellScriptBuildPhase",
    buildActionMask: "2147483647",
    name: "Run Script: Generate Screenplay Project",
    runOnlyForDeploymentPostprocessing: "0",
    shellPath: "/bin/sh",
    shellScript: shellScript,
    inputPaths: ["$(CODESIGNING_FOLDER_PATH)/Info.plist"],
  };

  return new PBXBuildPhase(buildPhaseId, xcodeProject);
}
