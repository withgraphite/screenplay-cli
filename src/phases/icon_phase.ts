#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { PBXGroup, PBXProject, Utils } from "xcodejs";

export function addScreenplayIconPhase(
  xcodeProjectPath: string,
  xcodeProject: PBXProject
): string {
  const iconDir = path.join(
    xcodeProjectPath,
    "../Screenplay/screenplay-icons.xcassets"
  );
  fs.mkdirpSync(iconDir);
  fs.copySync(
    path.join(__dirname, "../../assets/screenplay-icons.xcassets"),
    iconDir
  );

  const fileId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][fileId] = {
    isa: "PBXFileReference",
    lastKnownFileType: "folder.assetcatalog",
    path: "screenplay-icons.xcassets",
    sourceTree: "<group>",
  };

  const folderId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][folderId] = {
    isa: "PBXGroup",
    children: [fileId],
    path: "Screenplay",
    sourceTree: "<group>",
  };

  xcodeProject
    .rootObject()
    .mainGroup()
    .addChild(new PBXGroup(folderId, xcodeProject));

  const buildPhaseFileId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseFileId] = {
    isa: "PBXBuildFile",
    fileRef: fileId,
  };

  const buildPhaseId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildPhaseId] = {
    isa: "PBXResourcesBuildPhase",
    buildActionMask: "2147483647",
    runOnlyForDeploymentPostprocessing: "0",
    files: [buildPhaseFileId],
  };

  return buildPhaseId;
}
