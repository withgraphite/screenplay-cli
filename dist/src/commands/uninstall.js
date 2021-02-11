"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeScreenplayManagedTargetsAndProducts = exports.uninstall = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../lib/utils");
function uninstall(xcodeProjectPath) {
    const xcodeProject = utils_1.readProject(xcodeProjectPath);
    removeScreenplayManagedTargetsAndProducts(xcodeProject);
    xcodeProject.writeFileSync(path_1.default.join(xcodeProjectPath, "project.pbxproj"));
    console.log(`Screenplay has been uninstalled.`);
}
exports.uninstall = uninstall;
function removeScreenplayIcon(xcodeProject) {
    const idsToRemove = [];
    const iconFileRefId = Object.keys(xcodeProject._defn["objects"]).find((key) => xcodeProject._defn["objects"][key]["path"] == "screenplay-icons.xcassets");
    if (iconFileRefId) {
        idsToRemove.push(iconFileRefId);
        // Find PBXBuildFile
        const pbxBuildFile = Object.keys(xcodeProject._defn["objects"]).find((key) => xcodeProject._defn["objects"][key]["fileRef"] == iconFileRefId);
        if (pbxBuildFile) {
            idsToRemove.push(pbxBuildFile);
        }
        // Find parents
        const pbxGroupId = Object.keys(xcodeProject._defn["objects"]).find((key) => xcodeProject._defn["objects"][key]["isa"] == "PBXGroup" &&
            xcodeProject._defn["objects"][key]["path"] == "Screenplay");
        if (pbxGroupId) {
            idsToRemove.push(pbxGroupId);
        }
        const rootGroupId = Object.keys(xcodeProject._defn["objects"]).find((key) => xcodeProject._defn["objects"][key]["isa"] == "PBXGroup" &&
            xcodeProject._defn["objects"][key]["children"] &&
            xcodeProject._defn["objects"][key]["children"].includes(pbxGroupId));
        if (rootGroupId) {
            xcodeProject._defn["objects"][rootGroupId]["children"] = xcodeProject
                ._defn["objects"][rootGroupId]["children"].filter((id) => id != pbxGroupId);
        }
    }
    idsToRemove.forEach((key) => {
        delete xcodeProject._defn["objects"][key];
    });
}
function removeScreenplayManagedTargetsAndProducts(xcodeProject) {
    xcodeProject
        .rootObject()
        .targets()
        .forEach((target) => {
        // TODO: At some point we should update this heuristic
        // (Maybe check a custom build setting or something)
        if (target.name().startsWith("Screenplay-")) {
            target
                .buildConfigurationList()
                .buildConfigs()
                .forEach((config) => {
                config.remove();
            });
            target.buildConfigurationList().remove();
            target.buildPhases().forEach((bp) => {
                bp.remove();
            });
            const product = target.product();
            const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
            xcodeProject._defn["objects"][productRefGroupId]["children"] = xcodeProject._defn["objects"][productRefGroupId]["children"].filter((productId) => {
                return productId !== product._id;
            });
            product.remove();
            removeScreenplayIcon(xcodeProject);
            xcodeProject.rootObject()._defn["targets"] = xcodeProject
                .rootObject()
                ._defn["targets"].filter((targetId) => {
                return targetId !== target._id;
            });
            target.remove();
        }
    });
}
exports.removeScreenplayManagedTargetsAndProducts = removeScreenplayManagedTargetsAndProducts;
//# sourceMappingURL=uninstall.js.map