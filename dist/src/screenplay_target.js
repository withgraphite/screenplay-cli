#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScreenplayAppTarget = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const shared_routes_1 = require("shared-routes");
const xcodejs_1 = require("xcodejs");
const build_phase_1 = require("./build_phase");
const build_product_1 = require("./build_product");
const icon_phase_1 = require("./icon_phase");
const api_1 = require("./lib/api");
const utils_1 = require("./utils");
// TODO: This feels super rickety, basically relies on knowledge of framework name and that no variables or $(...) commands are included
// Also note: I think this might be wrong - right now we pull frameworks from the bulid products dir, but we may want to first copy frameworks (codesign on copy) and THEN copy it so we have codesigning (but that assumes we won't update codesigning...)
function generateBuildPhaseScript() {
    const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${api_1.endpointWithArgs(shared_routes_1.api.scripts.buildPhaseDownloader, {}, { appSecret: "__REPLACE_ME__" }).replace("__REPLACE_ME__", "$SCREENPLAY_APP_KEY")}`;
    return [
        `curl -o /dev/null -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
        `&& curl -s "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
        `| bash -s --`,
        `1>&2`,
        `|| (echo "error: Failed to download and execute Screenplay build script." && exit 1)`,
    ].join(" ");
}
function addScreenplayAppTarget(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // Swap new app token for app secret
        const [buildSetting, returnedAppTarget,] = xcodejs_1.getBuildSettingsAndTargetNameFromTarget(opts.xcodeProjectPath, opts.appTarget.name(), {});
        if (opts.appTarget.name() !== returnedAppTarget ||
            opts.xcodeProject
                .rootObject()
                .targets()
                .filter((target) => {
                return target.name() === returnedAppTarget;
            }).length > 1) {
            utils_1.error("Error! Many targets with the same name detected");
        }
        const name = opts.xcodeProject.extractAppName(buildSetting);
        if (name === null) {
            utils_1.error("Error! Could not infer name");
        }
        let appSecret = opts.appToken;
        let appId = null;
        if (opts.newAppToken) {
            const appSecretRequest = yield api_1.requestWithArgs(shared_routes_1.api.apps.create, {
                name: name,
            }, {}, {
                newAppToken: opts.newAppToken,
            });
            appSecret = appSecretRequest.appSecret;
            appId = appSecretRequest.id;
            const icon = opts.xcodeProject.extractMarketingAppIcon(buildSetting, opts.appTarget);
            if (icon) {
                yield api_1.requestWithArgs(shared_routes_1.api.apps.updateAppIcon, fs_extra_1.default.readFileSync(icon), {}, { appSecret: appSecretRequest.appSecret });
            }
        }
        const assetIconPhaseId = icon_phase_1.addScreenplayIconPhase(opts.xcodeProjectPath, opts.xcodeProject);
        const buildPhaseId = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, generateBuildPhaseScript());
        const buildProductId = build_product_1.addScreenplayBuildProduct(opts.xcodeProject, opts.appTarget);
        const duplicatedBuildConfigListId = opts.xcodeProject.deepDuplicate(opts.appTarget.buildConfigurationList()._id);
        const duplicatedBuildConfigList = new xcodejs_1.PBXBuildConfigList(duplicatedBuildConfigListId, opts.xcodeProject);
        duplicatedBuildConfigList.buildConfigs().forEach((buildConfig) => {
            // If we embed the swift std lib, then xcode tries to use source maps to find the file we built
            // the app from (my guess is to try and determine which features to include). B/c that source file
            // doesn't exist (as it was built in intercut), we're just going to turn this off
            buildConfig.buildSettings()["ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES"] = "NO";
            // We don't need this project to generate a plist because we generate it for them as part of the
            // build phase - alterantively we could set:
            // DONT_GENERATE_INFOPLIST_FILE = YES
            // INFOPLIST_FILE = ""
            // But there is some tech debt where we use the INFOPLIST_FILE variable elsewhere (when we should
            // grab the infoplist from the framework build settings instead); until we clean that up, we can
            // take this approach instead
            buildConfig.buildSettings()["INFOPLIST_PREPROCESS"] = "NO";
            buildConfig.buildSettings()["INFOPLIST_PREFIX_HEADER"] = undefined;
            // Some people *Cough, wikipedia, Cough* choose to overwrite this with a const - which causes problems
            // for us when we try and build the project b/c both the Wikipedia target and the Screenplay-Wikipedia
            // target produce "Wikipedia.app" and xcode needs product names to be unique in order to infer deps
            // (Otherwise if someone wants to build "Wikipedia.app" then xcode has no idea which to build)
            buildConfig.buildSettings()["PRODUCT_NAME"] = "$(TARGET_NAME)";
            // For the dummy Screenplay icon we put in place
            buildConfig.buildSettings()["ASSETCATALOG_COMPILER_APPICON_NAME"] =
                "AppIcon";
            buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
            buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
            if (opts.workspacePath) {
                buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path_1.default.relative(path_1.default.dirname(opts.xcodeProjectPath), opts.workspacePath);
            }
        });
        const buildTargetId = xcodejs_1.Utils.generateUUID(opts.xcodeProject.allObjectKeys());
        opts.xcodeProject._defn["objects"][buildTargetId] = {
            isa: "PBXNativeTarget",
            buildConfigurationList: duplicatedBuildConfigListId,
            buildPhases: [assetIconPhaseId, buildPhaseId],
            buildRules: [],
            name: `Screenplay-${opts.appTarget.name()}`,
            productName: `Screenplay-${opts.appTarget.name()}`,
            productReference: buildProductId,
            productType: "com.apple.product-type.application",
        };
        opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);
        return [
            appId,
            new xcodejs_1.PBXNativeTarget(buildTargetId, opts.xcodeProject),
        ];
    });
}
exports.addScreenplayAppTarget = addScreenplayAppTarget;
//# sourceMappingURL=screenplay_target.js.map