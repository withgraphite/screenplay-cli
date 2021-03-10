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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const shared_routes_1 = require("shared-routes");
const xcodejs_1 = require("xcodejs");
const api_1 = require("../lib/api");
const utils_1 = require("../lib/utils");
const build_phase_1 = require("../phases/build_phase");
const icon_phase_1 = require("../phases/icon_phase");
const build_product_1 = require("../products/build_product");
function generateBuildPhaseScript() {
    const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${shared_routes_1.request
        .endpointWithArgs(shared_routes_1.localhostApiServerWithPort(`\${NODE_PORT:-8000}`), shared_routes_1.api.scripts.buildPhaseDownloader, {}, { appSecret: "__REPLACE_ME__" })
        .replace("__REPLACE_ME__", "$SCREENPLAY_APP_KEY")}`;
    return [
        `curl -o /dev/null -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
        `&& curl -s "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"`,
        `| bash -s --`,
        `1>&2`,
        `|| (echo "error: Failed to download and execute Screenplay build script." && exit 1)`,
    ].join(" ");
}
function generateVersionBundleScript(scheme, destination, workspace) {
    return [
        `${process.env.GITHUB_WORKSPACE
            ? process.env.GITHUB_WORKSPACE
            : path_1.default.join(os_1.default.homedir(), "monologue")}/build-phase/dist/build-phase.latest.pkg`,
        `build-version-bundle`,
        `--scheme "${scheme}"`,
        `--destination ${destination}`,
        workspace ? `--workspace "${workspace}"` : "",
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
        const buildPhaseId = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, opts.versionBundleDestination
            ? generateVersionBundleScript(opts.appScheme, opts.versionBundleDestination, opts.workspacePath)
            : generateBuildPhaseScript());
        const buildProductId = build_product_1.addScreenplayBuildProduct(opts.xcodeProject, opts.appTarget, `Screenplay-${opts.appTarget.product()._defn["path"]}`);
        const duplicatedBuildConfigList = opts.xcodeProject.duplicateBuildConfigList(opts.appTarget.buildConfigurationList(), opts.xcodeProject);
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
            // Product names default to $(TARGET_NAME), but might be a hardcoded string. Account for both.
            if (buildConfig.buildSettings()["PRODUCT_NAME"] == "$(TARGET_NAME)") {
                buildConfig.buildSettings()["PRODUCT_NAME"] = `Screenplay-${opts.appTarget.name()}`;
            }
            else {
                buildConfig.buildSettings()["PRODUCT_NAME"] = `Screenplay-${buildConfig.buildSettings()["PRODUCT_NAME"]}`;
            }
            // For the dummy Screenplay icon we put in place
            buildConfig.buildSettings()["ASSETCATALOG_COMPILER_APPICON_NAME"] =
                "AppIcon";
            buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
            buildConfig.buildSettings()["SCREENPLAY_ORIGINAL_APP_PRODUCT"] = opts.appTarget.product()._defn["path"];
            buildConfig.buildSettings()["SCREENPLAY_SCHEME"] = opts.appScheme;
            if (opts.workspacePath) {
                buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path_1.default.relative(path_1.default.dirname(opts.xcodeProjectPath), opts.workspacePath);
            }
            // Configurations
            if (opts.withExtensions) {
                buildConfig.buildSettings()["SCREENPLAY_EXP_EXTENSIONS"] = "YES";
            }
            if (opts.withFromApp) {
                buildConfig.buildSettings()["SCREENPLAY_EXP_FROM_APP"] = "YES";
            }
        });
        const containerItemProxy = xcodejs_1.Utils.generateUUID(opts.xcodeProject.allObjectKeys());
        opts.xcodeProject._defn["objects"][containerItemProxy] = {
            isa: "PBXContainerItemProxy",
            containerPortal: opts.xcodeProject.rootObject()._id,
            proxyType: "1",
            remoteGlobalIDString: opts.appTarget._id,
            remoteInfo: opts.appTarget.name(),
        };
        const appTargetDependency = xcodejs_1.Utils.generateUUID(opts.xcodeProject.allObjectKeys());
        opts.xcodeProject._defn["objects"][appTargetDependency] = {
            isa: "PBXTargetDependency",
            target: opts.appTarget._id,
            targetProxy: containerItemProxy,
        };
        const buildTargetId = xcodejs_1.Utils.generateUUID(opts.xcodeProject.allObjectKeys());
        opts.xcodeProject._defn["objects"][buildTargetId] = {
            isa: "PBXNativeTarget",
            buildConfigurationList: duplicatedBuildConfigList._id,
            buildPhases: [assetIconPhaseId, buildPhaseId],
            buildRules: [],
            dependencies: [appTargetDependency],
            name: `Screenplay-${opts.appTarget.name()}`,
            productName: `Screenplay-${opts.appTarget._defn["productName"]}`,
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