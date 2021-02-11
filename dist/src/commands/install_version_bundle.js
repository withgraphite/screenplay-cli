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
exports.installVersionBundle = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
const utils_1 = require("../lib/utils");
const version_bundle_target_1 = require("../targets/version_bundle_target");
function installVersionBundle(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(argv["xcode-project"]);
        const appTarget = utils_1.extractTarget(xcodeProject, argv["app-target"]);
        const porkspace = {
            project: argv["xcode-project"],
            workspace: argv["workspace"],
        };
        // Make sure to set synthetic versions on the version bundle source target (not the new one)
        appTarget
            .buildConfigurationList()
            .buildConfigs()
            .forEach((buildConfig) => {
            buildConfig.buildSettings()["MARKETING_VERSION"] = argv["app-version"];
        });
        const schemeName = utils_1.determineScheme({
            appTargetName: appTarget.name(),
            porkspace: porkspace,
            schemeName: argv["app-scheme"],
        });
        const buildTarget = version_bundle_target_1.addVersionBundleTarget({
            porkspace: {
                project: argv["xcode-project"],
                workspace: argv["workspace"],
            },
            xcodeProject: xcodeProject,
            appTarget: appTarget,
            appScheme: schemeName,
            destination: argv.destination,
        });
        if (schemeName) {
            xcodejs_1.XCSchemes.createSchema({
                srcSchemeName: schemeName,
                projectPath: argv["xcode-project"],
                workspacePath: argv["workspace"],
                srcAppTarget: appTarget,
                newBuildTarget: buildTarget,
                buildableNameExtension: "app",
            });
        }
        xcodeProject.writeFileSync(path_1.default.join(argv["xcode-project"], "project.pbxproj"));
        console.log(chalk_1.default.cyanBright("Screenplay successfully installed!"));
    });
}
exports.installVersionBundle = installVersionBundle;
//# sourceMappingURL=install_version_bundle.js.map