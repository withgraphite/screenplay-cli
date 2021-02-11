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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const xcodejs_1 = require("xcodejs");
const build_phase_1 = require("./build_phase");
const build_product_1 = require("./build_product");
const utils_1 = require("./utils");
function generateVersionBundleScript(scheme, destination, workspace) {
    return [
        `${process.env.GITHUB_WORKSPACE
            ? process.env.GITHUB_WORKSPACE
            : path_1.default.join(os_1.default.homedir(), "monologue")}/build-phase/dist/build-phase.latest.pkg`,
        `build-version-bundle`,
        `--scheme ${scheme}`,
        `--destination ${destination}`,
        workspace ? `--workspace ${workspace}` : "",
    ].join(" ");
}
function addScreenplayVersionBundleTarget(opts) {
    const buildPhaseId = build_phase_1.addScreenplayBuildPhase(opts.xcodeProject, generateVersionBundleScript(opts.appScheme, opts.destination, opts.porkspace.workspace));
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
        productName: `Screenplay-${opts.appTarget.name()}`,
        productReference: buildProductId,
        productType: "com.apple.product-type.application",
    };
    opts.xcodeProject.rootObject()._defn["targets"].push(buildTargetId);
    return new xcodejs_1.PBXNativeTarget(buildTargetId, opts.xcodeProject);
}
function installVersionBundle(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(argv["xcode-project"]);
        const appTarget = utils_1.extractTarget(xcodeProject.appTargets(), argv["app-target"]);
        // Make sure to set synthetic versions on the version bundle source target (not the new one)
        appTarget
            .buildConfigurationList()
            .buildConfigs()
            .forEach((buildConfig) => {
            buildConfig.buildSettings()["MARKETING_VERSION"] = argv["app-version"];
        });
        let schemeName = argv["app-scheme"];
        if (!schemeName) {
            schemeName = appTarget.name();
            if (!xcodejs_1.XCSchemes.findSrcSchemePath({
                projectPath: argv["xcode-project"],
                workspacePath: argv["workspace"],
                schemeName: schemeName,
            })) {
                utils_1.error(`Could not infer app scheme name, please provide it using the --app-scheme flag`);
            }
        }
        const buildTarget = addScreenplayVersionBundleTarget({
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
//# sourceMappingURL=dev_version_bundle_target.js.map