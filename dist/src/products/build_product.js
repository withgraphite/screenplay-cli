#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScreenplayBuildProduct = void 0;
const xcodejs_1 = require("xcodejs");
function addScreenplayBuildProduct(xcodeProject, appTarget, name) {
    const buildProductId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildProductId] = {
        isa: "PBXFileReference",
        explicitFileType: "wrapper.application",
        includeInIndex: "0",
        path: `${name}`,
        sourceTree: "BUILT_PRODUCTS_DIR",
    };
    const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
    xcodeProject._defn["objects"][productRefGroupId]["children"].push(buildProductId);
    return buildProductId;
}
exports.addScreenplayBuildProduct = addScreenplayBuildProduct;
//# sourceMappingURL=build_product.js.map