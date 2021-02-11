#!/usr/bin/env node
import { PBXNativeTarget, PBXProject, Utils } from "xcodejs";

export function addScreenplayBuildProduct(
  xcodeProject: PBXProject,
  appTarget: PBXNativeTarget,
  name: string
): string {
  const buildProductId = Utils.generateUUID(xcodeProject.allObjectKeys());
  xcodeProject._defn["objects"][buildProductId] = {
    isa: "PBXFileReference",
    explicitFileType: "wrapper.application",
    includeInIndex: "0",
    path: `${name}`,
    sourceTree: "BUILT_PRODUCTS_DIR",
  };

  const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
  xcodeProject._defn["objects"][productRefGroupId]["children"].push(
    buildProductId
  );

  return buildProductId;
}
