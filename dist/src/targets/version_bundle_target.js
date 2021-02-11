"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVersionBundleTarget = void 0;
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
const build_phase_1 = require("../phases/build_phase");
const build_product_1 = require("../products/build_product");
const version_bundle_run_script_1 = require("../scripts/version_bundle_run_script");
function addVersionBundleTarget(opts) {
    const buildPhaseId = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, version_bundle_run_script_1.generateVersionBundleScript(opts.appScheme, opts.destination, opts.porkspace.workspace));
    const buildProductId = build_product_1.addScreenplayBuildProduct(opts.xcodeProject, opts.appTarget, `Screenplay-${opts.appTarget.product()._defn["path"]}`);
    const duplicatedBuildConfigListId = opts.xcodeProject.deepDuplicate(opts.appTarget.buildConfigurationList()._id);
    const duplicatedBuildConfigList = new xcodejs_1.PBXBuildConfigList(duplicatedBuildConfigListId, opts.xcodeProject);
    duplicatedBuildConfigList.buildConfigs().forEach((buildConfig) => {
        // If we embed the swift std lib, then xcode tries to use source maps to find the file we built
        // the app from (my guess is to try and determine which features to include). B/c that source file
        // doesn't exist (as it was built in intercut), we're just going to turn this off
        buildConfig.buildSettings()["ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES"] = "NO";
        // Product names default to $(TARGET_NAME), but might be a hardcoded string. Account for both.
        if (buildConfig.buildSettings()["PRODUCT_NAME"] == "$(TARGET_NAME)") {
            buildConfig.buildSettings()["PRODUCT_NAME"] = `Screenplay-${opts.appTarget.name()}`;
        }
        else {
            buildConfig.buildSettings()["PRODUCT_NAME"] = `Screenplay-${buildConfig.buildSettings()["PRODUCT_NAME"]}`;
        }
        // We don't need this project to generate a plist because we generate it for them as part of the
        // build phase - alterantively we could set:
        // DONT_GENERATE_INFOPLIST_FILE = YES
        // INFOPLIST_FILE = ""
        // But there is some tech debt where we use the INFOPLIST_FILE variable elsewhere (when we should
        // grab the infoplist from the framework build settings instead); until we clean that up, we can
        // take this approach instead
        buildConfig.buildSettings()["INFOPLIST_PREPROCESS"] = "NO";
        buildConfig.buildSettings()["INFOPLIST_PREFIX_HEADER"] = undefined;
        buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
        buildConfig.buildSettings()["SCREENPLAY_INCLUDED_VERSIONS"] = "latest";
        if (opts.porkspace.workspace) {
            buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path_1.default.relative(path_1.default.dirname(opts.porkspace.project), opts.porkspace.workspace);
        }
    });
    const buildTargetId = xcodejs_1.Utils.generateUUID(opts.xcodeProject.allObjectKeys());
    opts.xcodeProject._defn["objects"][buildTargetId] = {
        isa: "PBXNativeTarget",
        buildConfigurationList: duplicatedBuildConfigListId,
        buildPhases: [buildPhaseId],
        buildRules: [],
        name: `Screenplay-${opts.appTarget.name()}`,
        productName: `Screenplay-${opts.appTarget._defn["productName"]}`,
        productReference: buildProductId,
        productType: "com.apple.product-type.application",
    };
    opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);
    return new xcodejs_1.PBXNativeTarget(buildTargetId, opts.xcodeProject);
}
exports.addVersionBundleTarget = addVersionBundleTarget;
//# sourceMappingURL=version_bundle_target.js.map