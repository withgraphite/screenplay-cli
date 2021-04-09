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
function generateBuildPhaseScript() {
    const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${shared_routes_1.request.endpointWithArgs(shared_routes_1.localhostApiServerWithPort(`\${NODE_PORT:-8000}`), shared_routes_1.api.scripts.buildPhaseDownloader, {}, {})}`;
    return `#!/bin/bash
if curl -o /dev/null -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"; then
  curl -s -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}" | bash -s -- 1>&2;
  if [ 0 != $? ]; then
    echo "error: Failed to run the Screenplay script.";
    if [ "install" == $ACTION ]; then
      echo "If this is blocking release, set the SCREENPLAY_ENABLED build setting to NO to build without Screenplay.";
    fi
    exit 1;
  fi
elif [[ "YES" == $SCREENPLAY_ENABLED || ("NO" != $SCREENPLAY_ENABLED && "install" == $ACTION) ]]; then
  echo "error: Failed to download the Screenplay build script. Are you connected to the network?";
  exit 1;
fi`;
}
function generateVersionBundleScript(destination, workspace) {
    return `#!/bin/bash
if [ "NO" != $SCREENPLAY_ENABLED ]; then
  ${process.env.GITHUB_WORKSPACE
        ? process.env.GITHUB_WORKSPACE
        : path_1.default.join(os_1.default.homedir(), "monologue")}/public/build-phase/dist/build-phase.latest.pkg build-version-bundle --destination ${destination} ${workspace ? `--workspace "${workspace}"` : ""}
  fi
`;
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
                yield api_1.requestWithArgs(shared_routes_1.api.apps.updateAppIcon, fs_extra_1.default.readFileSync(icon), {}, {}, {
                    "X-SP-APP-SECRET": appSecretRequest.appSecret,
                });
            }
        }
        opts.appTarget
            .buildConfigurationList()
            .buildConfigs()
            .forEach((buildConfig) => {
            buildConfig.buildSettings()["SCREENPLAY_VERSION"] = "2";
            buildConfig.buildSettings()["SCREENPLAY_APP_KEY"] = appSecret;
            if (opts.workspacePath) {
                buildConfig.buildSettings()["SCREENPLAY_WORKSPACE"] = path_1.default.relative(path_1.default.dirname(opts.xcodeProjectPath), opts.workspacePath);
            }
            // Whether Screenplay is enabled
            if (buildConfig.name() === "Release" || opts.alwaysEnable) {
                buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "YES";
            }
            else if (buildConfig.name() === "Debug") {
                buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "NO";
            }
            else {
                buildConfig.buildSettings()["SCREENPLAY_ENABLED"] = "IF_ARCHIVING";
            }
            // Configurations
            if (opts.withExtensions) {
                buildConfig.buildSettings()["SCREENPLAY_EXP_EXTENSIONS"] = "YES";
            }
            if (opts.withFromApp) {
                buildConfig.buildSettings()["SCREENPLAY_EXP_FROM_APP"] = "YES";
            }
        });
        const buildPhase = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, opts.versionBundleDestination
            ? generateVersionBundleScript(opts.versionBundleDestination, opts.workspacePath)
            : generateBuildPhaseScript());
        opts.appTarget.addBuildPhase(buildPhase);
        return appId;
    });
}
exports.addScreenplayAppTarget = addScreenplayAppTarget;
//# sourceMappingURL=screenplay_target.js.map