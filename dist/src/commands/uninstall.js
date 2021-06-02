"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeScreenplayManagedTargetsAndProducts = exports.uninstall = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
const utils_1 = require("../lib/utils");
function uninstall(xcodeProjectPath, appTargetName) {
    const xcodeProject = utils_1.readProject(xcodeProjectPath);
    const appTarget = utils_1.extractTarget(xcodeProject, appTargetName);
    removeScreenplayManagedTargetsAndProducts(xcodeProjectPath, xcodeProject, appTarget);
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
            xcodeProject._defn["objects"][rootGroupId]["children"] = xcodeProject._defn["objects"][rootGroupId]["children"].filter((id) => id != pbxGroupId);
        }
    }
    idsToRemove.forEach((key) => {
        delete xcodeProject._defn["objects"][key];
    });
}
function removeScreenplayManagedTargetsAndProducts(xcodeProjectPath, xcodeProject, appTarget) {
    // uninstall v1
    removeScreenplayIcon(xcodeProject);
    xcodeProject
        .rootObject()
        .targets()
        .forEach((target) => {
        // TODO: At some point we should update this heuristic
        // (Maybe check a custom build setting or something)
        if (target.name() === "Screenplay-" + appTarget.name()) {
            const schemePath = xcodejs_1.XCSchemes.findSrcSchemePath({
                projectPath: xcodeProjectPath,
                schemeName: target.name(),
            });
            if (schemePath) {
                fs_extra_1.default.removeSync(schemePath);
            }
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
            xcodeProject._defn["objects"][productRefGroupId]["children"] =
                xcodeProject._defn["objects"][productRefGroupId]["children"].filter((productId) => {
                    return productId !== product._id;
                });
            product.remove();
            target.dependencies().forEach((dep) => {
                dep.targetProxy().remove();
                dep.remove();
            });
            xcodeProject.rootObject()._defn["targets"] = xcodeProject
                .rootObject()
                ._defn["targets"].filter((targetId) => {
                return targetId !== target._id;
            });
            target.remove();
        }
    });
    // uninstall v2
    if (appTarget
        .buildConfigurationList()
        .buildConfigs()
        .some((bc) => !!bc.buildSettings()["SCREENPLAY_VERSION"])) {
        appTarget
            .buildConfigurationList()
            .buildConfigs()
            .forEach((buildConfig) => {
            delete buildConfig.buildSettings()["SCREENPLAY_VERSION"];
            delete buildConfig.buildSettings()["SCREENPLAY_APP_KEY"];
            delete buildConfig.buildSettings()["SCREENPLAY_ENABLED"];
        });
        const buildPhases = appTarget._defn["buildPhases"];
        const lastBuildPhaseId = buildPhases.pop(); // pop returns and mutates
        delete xcodeProject._defn["objects"][lastBuildPhaseId];
        appTarget._defn["buildPhases"] = buildPhases;
    }
}
exports.removeScreenplayManagedTargetsAndProducts = removeScreenplayManagedTargetsAndProducts;
//# sourceMappingURL=uninstall.js.map