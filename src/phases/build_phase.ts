#!/usr/bin/env node
import { PBXProject, Utils } from "xcodejs";

export function addScreenplayBuildPhase(
  xcodeProject: PBXProject,
  shellScript: string
): string {
  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
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
