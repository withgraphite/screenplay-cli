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
const prompts_1 = __importDefault(require("prompts"));
const shared_routes_1 = require("shared-routes");
const splog_1 = require("splog");
const api_1 = require("../lib/api");
const utils_1 = require("../lib/utils");
const build_phase_1 = require("../phases/build_phase");
function generateBuildPhaseScript() {
    const SCREENPLAY_BUILD_PHASE_DOWNLOADER = `${shared_routes_1.request.endpointWithArgs(process.env.NODE_ENV === "development"
        ? shared_routes_1.localhostApiServerWithPort(`\${NODE_PORT:-8000}`)
        : shared_routes_1.PROD_API_SERVER, shared_routes_1.api.scripts.buildPhaseDownloader, {}, {})}`;
    return `#!/bin/bash
# Learn more at "https://screenplay.dev/"
if curl -o /dev/null -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" -sfI "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}"; then
  curl -s -H "X-SP-APP-SECRET: $SCREENPLAY_APP_KEY" "${SCREENPLAY_BUILD_PHASE_DOWNLOADER}" | bash -s -- 1>&2;
  if [ 0 != $? ]; then
    echo "error: Failed to run the Screenplay build script.";
    if [ "install" == $ACTION ]; then
      echo "If this is blocking release, you can set SCREENPLAY_ENABLED to NO on your app target's Build Settings page in Xcode to build without Screenplay.";
    fi
    exit 1;
  fi
elif [[ "YES" == $SCREENPLAY_ENABLED || ("NO" != $SCREENPLAY_ENABLED && "install" == $ACTION) ]]; then
  echo "error: Failed to download the Screenplay build script. Check your network connection and try again?";
  exit 1;
fi`;
}
function getBundleIdentifier(appTarget, acceptPrompts) {
    return __awaiter(this, void 0, void 0, function* () {
        const bundleIdentifiers = [
            ...new Set(// for uniquing
            appTarget
                .buildConfigurationList()
                .buildConfigs()
                .map((config) => config.buildSettings()["PRODUCT_BUNDLE_IDENTIFIER"])),
        ];
        return bundleIdentifiers.length == 1 || acceptPrompts
            ? bundleIdentifiers[0]
            : bundleIdentifiers[(yield prompts_1.default({
                type: "select",
                name: "value",
                choices: bundleIdentifiers,
                message: `Multiple bundle identifiers found for target "${appTarget.name()}" - select one to use with Screenplay`,
                initial: 0,
            })).value];
    });
}
function checkForExistingAppSecret(installToken, bundleIdentifier, acceptPrompts) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check to see if the app is already registered:
        const existingAppSecret = yield api_1.requestWithArgs(shared_routes_1.api.apps.getSecret, {}, {
            newAppToken: installToken,
            bundleIdentifier: bundleIdentifier,
        });
        if (existingAppSecret.appSecret) {
            console.log(`Your org has already added an app with bundle identifier "${bundleIdentifier}" on Screenplay.`);
            const reinstall = acceptPrompts
                ? true
                : (yield prompts_1.default({
                    type: "confirm",
                    name: "value",
                    message: `Would you like to install Screenplay using the existing app secret for "${bundleIdentifier}"? (Recommended)`,
                    initial: true,
                })).value;
            if (reinstall) {
                return existingAppSecret.appSecret;
            }
            else {
                splog_1.logError(`You cannot install Screenplay on an app which uses the same bundle identifier as an existing app in your org. Please update the bundle identifier on your app target and retry installing Screenplay.`);
                process.exit(1);
            }
        }
        return undefined;
    });
}
function requestNewAppSecret(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const appSecretRequest = yield api_1.requestWithArgs(shared_routes_1.api.apps.create, {
            name: opts.name,
            bundleIdentifier: opts.bundleIdentifier,
        }, {}, {
            newAppToken: opts.installToken,
        });
        const appSecret = appSecretRequest.appSecret;
        const appId = appSecretRequest.id;
        if (opts.icon) {
            yield api_1.requestWithArgs(shared_routes_1.api.apps.updateAppIcon, fs_extra_1.default.readFileSync(opts.icon), {}, {}, {
                "X-SP-APP-SECRET": appSecretRequest.appSecret,
            });
        }
        return { appSecret, appId };
    });
}
function getAppName(xcodeProject, target, acceptPrompts) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = {
            type: "text",
            name: "appName",
            message: "What is the name of your app?",
        };
        const inferredName = getInferredAppName(xcodeProject, target);
        if (acceptPrompts) {
            return inferredName;
        }
        if (inferredName !== null) {
            prompt.initial = inferredName;
        }
        const inputAppName = (yield prompts_1.default(prompt)).appName;
        if (isValidAppName(inputAppName)) {
            return inputAppName.trim();
        }
        return null;
    });
}
function getInferredAppName(xcodeProject, target) {
    const inferredName = utils_1.inferProductName(xcodeProject, target);
    if (inferredName === null || !isValidAppName(inferredName)) {
        return null;
    }
    return inferredName;
}
function isValidAppName(name) {
    return name !== null && name !== undefined && name.trim().length > 0;
}
function addScreenplayAppTarget(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(opts.xcodeProjectPath);
        const name = yield getAppName(xcodeProject, opts.appTarget, opts.acceptPrompts);
        if (name === null) {
            splog_1.logError("Please specify an app name.");
            process.exit(1);
        }
        let appId = null;
        const icon = utils_1.getAppIcon(xcodeProject, opts.appTarget);
        const bundleIdentifier = yield getBundleIdentifier(opts.appTarget, opts.acceptPrompts);
        // Allow for reassignment later
        let appSecret = opts.appSecret;
        // Consider the chance that this project already has this app registered.
        if (opts.installToken) {
            const existingAppSecret = yield checkForExistingAppSecret(opts.installToken, bundleIdentifier, opts.acceptPrompts);
            if (existingAppSecret) {
                appSecret = existingAppSecret;
            }
        }
        // Otherwise, create a new app
        if (!appSecret && opts.installToken) {
            const newAppDetails = yield requestNewAppSecret({
                icon: icon || undefined,
                name,
                bundleIdentifier,
                installToken: opts.installToken,
            });
            appId = newAppDetails.appId;
            appSecret = newAppDetails.appSecret;
        }
        // Install the details
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
        const buildPhase = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, generateBuildPhaseScript());
        opts.appTarget.addBuildPhase(buildPhase);
        return appId;
    });
}
exports.addScreenplayAppTarget = addScreenplayAppTarget;
//# sourceMappingURL=screenplay_target.js.map