#! /usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const shared_routes_1 = require("shared-routes");
const xcodejs_1 = require("xcodejs");
const xml_js_1 = __importDefault(require("xml-js"));
const yargs_1 = __importDefault(require("yargs"));
const utils_1 = require("./utils");
const API_SERVER = process.env.NODE_ENV === "development"
    ? "http://localhost:8000/v1"
    : "https://api.screenplay.dev/v1";
// TODO: This feels super rickety, basically relies on knowledge of framework name and that no variables or $(...) commands are included
// Also note: I think this might be wrong - right now we pull frameworks from the bulid products dir, but we may want to first copy frameworks (codesign on copy) and THEN copy it so we have codesigning (but that assumes we won't update codesigning...)
function generate_build_phase_script(frameworkName) {
    const SCREENPLAY_SERVER_ENDPOINT = `${API_SERVER}${shared_routes_1.api.scripts.buildPhaseDownloader.url}?apiKey=123`;
    return [
        `curl -o /dev/null -sfI "${SCREENPLAY_SERVER_ENDPOINT}"`,
        `&& curl -s "${SCREENPLAY_SERVER_ENDPOINT}"`,
        `| bash -s --`,
        `--framework "$BUILT_PRODUCTS_DIR"/"${frameworkName}.v$MARKETING_VERSION.framework"`,
        `--source "$PROJECT_FILE_PATH"/project.pbxproj`,
        `--destination "$CODESIGNING_FOLDER_PATH"`,
        `--cpuArch "$ARCHS"`,
        `--sdk "$SDK_NAME"`,
        `--targetName "$TARGETNAME"`,
        `--codeSignIdentity "$CODE_SIGN_IDENTITY"`,
        `--codeSignEntitlements "$PROJECT_DIR/$CODE_SIGN_ENTITLEMENTS"`,
        `--groupIdPrefixHACK "$GROUP_ID_PREFIX"`,
        `--infoPlistFile "$INFOPLIST_FILE"`,
        `|| (echo "error: Failed to download and execute Screenplay build script." && exit 1)`,
    ].join(" ");
}
function recursivelyMutateBuildRefs(defn, buildableName, blueprintName, blueprintIdentifier, originalBlueprintIdentifier) {
    Object.keys(defn).forEach((key) => {
        if (key === "_attributes" || key === "_declaration") {
            return;
        }
        else if (key === "BuildableReference") {
            const attributes = defn["BuildableReference"]["_attributes"];
            if (attributes["BlueprintIdentifier"] === originalBlueprintIdentifier) {
                attributes["BlueprintIdentifier"] = blueprintIdentifier;
                attributes["BuildableName"] = buildableName;
                attributes["BlueprintName"] = blueprintName;
            }
        }
        else {
            const value = defn[key];
            if (value instanceof Array) {
                value.forEach((innerValue) => {
                    recursivelyMutateBuildRefs(innerValue, buildableName, blueprintName, blueprintIdentifier, originalBlueprintIdentifier);
                });
            }
            else if (value instanceof Object) {
                recursivelyMutateBuildRefs(value, buildableName, blueprintName, blueprintIdentifier, originalBlueprintIdentifier);
            }
            else {
                utils_1.error("Unknown literal found in xcscheme parse");
            }
        }
    });
}
function addScreenplayBuildPhase(xcodeProject, frameworkName) {
    const buildPhaseId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildPhaseId] = {
        isa: "PBXShellScriptBuildPhase",
        buildActionMask: 2147483647,
        name: "Run Script: Generate Screenplay Project",
        runOnlyForDeploymentPostprocessing: 0,
        shellPath: "/bin/sh",
        shellScript: generate_build_phase_script(frameworkName),
    };
    return buildPhaseId;
}
function addScreenplayBuildProduct(xcodeProject, appTarget) {
    const buildProductId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildProductId] = {
        isa: "PBXFileReference",
        explicitFileType: "wrapper.application",
        includeInIndex: 0,
        path: `Screenplay-${appTarget.name()}.app`,
        sourceTree: "BUILT_PRODUCTS_DIR",
    };
    const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
    // Note: The next line isn't entirely correct, technically the product could be put ANYWHERE
    xcodeProject._defn["objects"][productRefGroupId]["children"].push(buildProductId);
    return buildProductId;
}
function addScreenplayBuildDependencyTargetProxy(xcodeProject, frameworkTarget) {
    const buildDependencyTargetProxyId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildDependencyTargetProxyId] = {
        isa: "PBXContainerItemProxy",
        containerPortal: xcodeProject.rootObject()._id,
        proxyType: 1,
        remoteGlobalIDString: frameworkTarget._id,
        remoteInfo: frameworkTarget._defn["name"],
    };
    return buildDependencyTargetProxyId;
}
function addScreenplayBuildDependency(xcodeProject, frameworkTarget, buildDependencyTargetProxyId) {
    const buildDependencyId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildDependencyId] = {
        isa: "PBXTargetDependency",
        target: frameworkTarget._id,
        targetProxy: buildDependencyTargetProxyId,
    };
    return buildDependencyId;
}
function addScreenplayAppTarget(xcodeProject, frameworkTarget, appTarget) {
    const buildPhaseId = addScreenplayBuildPhase(xcodeProject, 
    // TODO: This is unreliable. What if the name includes env vars specific to the target?
    frameworkTarget._defn["name"]);
    const buildProductId = addScreenplayBuildProduct(xcodeProject, appTarget);
    const buildDependencyTargetProxyId = addScreenplayBuildDependencyTargetProxy(xcodeProject, frameworkTarget);
    const buildDependencyId = addScreenplayBuildDependency(xcodeProject, frameworkTarget, buildDependencyTargetProxyId);
    const duplicatedBuildConfigListId = xcodeProject.deepDuplicate(appTarget.buildConfigurationList()._id);
    const duplicatedBuildConfigList = new xcodejs_1.PBXBuildConfigList(duplicatedBuildConfigListId, xcodeProject);
    duplicatedBuildConfigList.buildConfigs().forEach((buildConfig) => {
        // If we embed the swift std lib, then xcode tries to use source maps to find the file we built
        // the app from (my guess is to try and determine which features to include). B/c that source file
        // doesn't exist (as it was built in intercut), we're just going to turn this off
        buildConfig.buildSettings()["ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES"] = "NO";
    });
    const buildTargetId = xcodejs_1.Utils.generateUUID(xcodeProject.allObjectKeys());
    xcodeProject._defn["objects"][buildTargetId] = {
        isa: "PBXNativeTarget",
        buildConfigurationList: duplicatedBuildConfigListId,
        buildPhases: [buildPhaseId],
        buildRules: [],
        dependencies: [buildDependencyId],
        name: `Screenplay-${appTarget.name()}`,
        productName: `Screenplay-${appTarget.name()}`,
        productReference: buildProductId,
        productType: "com.apple.product-type.application",
    };
    xcodeProject.rootObject()._defn["targets"].push(buildTargetId);
    return buildTargetId;
}
function createFrameworkTargetFromAppTarget(xcodeProject, appTarget) {
    const frameworkTarget = xcodeProject.duplicateTargetAndBuildSettings(appTarget);
    frameworkTarget._defn["name"] = `Screenplay-Framework-${frameworkTarget._defn["name"]}`;
    frameworkTarget._defn["productName"] = `Screenplay-Framework-${frameworkTarget._defn["productName"]}`;
    frameworkTarget._defn["productType"] = "com.apple.product-type.framework";
    frameworkTarget.product()._defn["explicitFileType"] = "wrapper.framework";
    frameworkTarget
        .buildConfigurationList()
        .buildConfigs()
        .forEach((buildConfig, index) => {
        const buildSettings = buildConfig.buildSettings();
        buildSettings["PRODUCT_NAME"] = frameworkTarget._defn["productName"];
        buildSettings["DYLIB_INSTALL_NAME_BASE"] = "@rpath";
        buildSettings["LD_RUNPATH_SEARCH_PATHS"] = [
            "$(inherited)",
            "@executable_path/Frameworks",
            "@executable_path/Frameworks/$(CONTENTS_FOLDER_PATH)/Frameworks",
        ];
        // TODO: The marketing version can't go in the name (presumably b/c it's not a build setting). That indicates this might be a bad control plane.
        buildSettings["WRAPPER_EXTENSION"] = "v$(MARKETING_VERSION).framework";
        buildSettings["PRODUCT_NAME"] = "$(TARGET_NAME)"; // Some people *Cough, wikipedia, Cough* choose to overwrite this - which causes problems for us when we try and copy what we believe to be the correct dir to intercut
        buildSettings["PRODUCT_BUNDLE_IDENTIFIER"] = `${buildSettings["PRODUCT_BUNDLE_IDENTIFIER"]}.v$(MARKETING_VERSION)`;
    });
    return frameworkTarget;
}
function removeScreenplayManagedTargetsAndProducts(xcodeProject) {
    xcodeProject
        .rootObject()
        .targets()
        .forEach((target) => {
        // TODO: At some point we should update this heuristic
        // (Maybe check a custom build setting or something)
        if (target.name().startsWith("Screenplay-")) {
            // should remove those once it realizes they're not attached to anything
            const product = target.product();
            const productRefGroupId = xcodeProject.rootObject()._defn["productRefGroup"];
            xcodeProject._defn["objects"][productRefGroupId]["children"] = xcodeProject._defn["objects"][productRefGroupId]["children"].filter((productId) => {
                return productId !== product._id;
            });
            product.remove();
            xcodeProject.rootObject()._defn["targets"] = xcodeProject
                .rootObject()
                ._defn["targets"].filter((targetId) => {
                return targetId !== target._id;
            });
            // This leaves a whole lot of dangling keys (such as buildConfigs) but xcode
            target.remove();
        }
    });
}
function extractTarget(targets, targetName) {
    if (targets.length === 0) {
        utils_1.error("No app targets detected in the Xcode project.");
    }
    else if (targets.length === 1) {
        return targets[0];
    }
    else {
        const target = targets.find((t) => {
            return t.name() === targetName;
        });
        if (target) {
            return target;
        }
        utils_1.error(`More than one app target detected, please specify one with the --app-target flag. (Potential app targets: ${targets.map((t) => {
            return `"${t.name()}"`;
        })})`);
    }
}
function readProject(projectPath) {
    if (!fs_extra_1.default.existsSync(projectPath)) {
        utils_1.error(`Could not find Xcode project ("${projectPath}").`);
    }
    return xcodejs_1.PBXProject.readFileSync(path_1.default.join(projectPath, "project.pbxproj"));
}
function createSchema(projectPath, appTarget, buildTargetId) {
    const schemesFolder = path_1.default.join(projectPath, "xcshareddata", "xcschemes");
    if (fs_extra_1.default.existsSync(schemesFolder)) {
        const appSchemePath = path_1.default.join(schemesFolder, appTarget.name() + ".xcscheme");
        if (fs_extra_1.default.existsSync(appSchemePath)) {
            const data = fs_extra_1.default.readFileSync(appSchemePath);
            const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
            recursivelyMutateBuildRefs(defn, `Screenplay-${appTarget.name()}.app`, `Screenplay-${appTarget.name()}`, buildTargetId, appTarget._id);
            fs_extra_1.default.writeFileSync(path_1.default.join(schemesFolder, `Screenplay-${appTarget.name()}.xcscheme`), xml_js_1.default.js2xml(defn, { compact: true }));
        }
        else {
            utils_1.warn(`XCSchemes found but could not find a scheme for the app target ("${appTarget.name()}")`);
        }
    }
}
function install(argv) {
    const xcodeProjectPath = argv["xcode_project"];
    const xcodeProject = readProject(xcodeProjectPath);
    const sourceAppTargetName = argv["app_target"];
    // To get idempotency, we simply remove and re-install
    removeScreenplayManagedTargetsAndProducts(xcodeProject);
    const appTargets = xcodeProject.appTargets();
    const appTarget = extractTarget(appTargets, sourceAppTargetName);
    const frameworkTarget = createFrameworkTargetFromAppTarget(xcodeProject, appTarget);
    const buildTargetId = addScreenplayAppTarget(xcodeProject, frameworkTarget, appTarget);
    createSchema(xcodeProjectPath, appTarget, buildTargetId);
    // Note: For some apps (such as DuckDuckGo) the target's app icon is only
    // set if you copy the relevant files / include that XCAsset.
    //
    // While it's nice, it seems like an unnecessary build step for a small nicety
    // it's possible we'll explore this in the future
    xcodeProject.writeFileSync(path_1.default.join(xcodeProjectPath, "project.pbxproj"));
}
yargs_1.default
    .command("install <xcode_project>", "Add Screenplay to the specified Xcode project", (yargs) => {
    yargs.positional("xcode_project", {
        describe: "The Xcode project to install Screenplay on",
    });
    yargs.option("app_target", {
        describe: "The name of the target which builds your app",
    });
}, (argv) => {
    install(argv);
})
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map