"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const pbx_build_config_1 = __importDefault(require("./pbx_build_config"));
const pbx_build_config_list_1 = __importDefault(require("./pbx_build_config_list"));
const pbx_build_file_1 = __importDefault(require("./pbx_build_file"));
const pbx_group_1 = __importDefault(require("./pbx_group"));
const pbx_native_target_1 = __importDefault(require("./pbx_native_target"));
const pbx_root_object_1 = __importDefault(require("./pbx_root_object"));
const plist_1 = require("./plist");
const utils_1 = require("./utils");
class PBXProj {
    constructor(defn, srcRoot) {
        this._defn = defn;
        this._srcRoot = srcRoot;
    }
    // ***********
    // Convenience
    // ***********
    rootObject() {
        return new pbx_root_object_1.default(this._defn["rootObject"], this);
    }
    removeNode(id) {
        delete this._defn["objects"][id];
    }
    appTargets() {
        return this.rootObject()
            .targets()
            .filter((target) => {
            return target.productType() === "com.apple.product-type.application";
        });
    }
    // *******
    // On-disk
    // *******
    static readFileSync(file) {
        const data = child_process_1.execSync(`plutil -convert json -o - "${file}"`, {
            maxBuffer: 1024 * 1024 * 1024,
        });
        const defn = JSON.parse(data.toString());
        return new PBXProj(defn, path.dirname(path.dirname(file)));
    }
    writeFileSync(file, format = "xml1") {
        // Strangely, xcode can accept ANY format of the pbxproj (including JSON!)
        // just when you resave the project, it will get rewritten as a traditional one
        //
        // HOWEVER, on big projects, xcode craps out on JSON and doesn't convert /
        // greys out the save button. For that reason we export as XML
        // fs.writeFileSync(file, JSON.stringify(this._defn));
        child_process_1.execSync(`plutil -convert ${format} - -o "${file}"`, {
            input: JSON.stringify(this._defn),
        });
    }
    // *******
    // Updates
    // *******
    duplicateTargetAndBuildSettings(target) {
        const newTargetId = this.deepDuplicate(target._id);
        const newTarget = new pbx_native_target_1.default(newTargetId, this);
        // force a product duplication
        newTarget.setProduct(this.deepDuplicate(newTarget.product()._id, true));
        // add target to project
        this.rootObject()._defn["targets"].push(newTargetId);
        return newTarget;
    }
    stripAppTargetsExcept(name) {
        for (const target of this.rootObject().targets()) {
            const isApp = target.productType() === "com.apple.product-type.application";
            if (isApp && target.name() !== name) {
                // kill the target
                target.remove();
                // kill the target edge
                this.rootObject().removeTarget(target);
            }
        }
    }
    patchPath(initialPath, filePathPrefix) {
        if (initialPath.startsWith("${SRCROOT}")) {
            initialPath = initialPath.replace("${SRCROOT}", "");
        }
        if (initialPath.startsWith("$(SRCROOT)")) {
            initialPath = initialPath.replace("$(SRCROOT)", "");
        }
        return path.join("$(SRCROOT)", filePathPrefix, initialPath);
    }
    patchInfoPlist(initialPath, filePathPrefix, buildConfig) {
        const buildSettings = buildConfig.buildSettings();
        buildSettings["INFOPLIST_FILE"] = this.patchPath(initialPath, filePathPrefix);
    }
    patchHeaderSearchPathsForApp(buildSettings) {
        // Apps are treated slightly differently than frameworks in how headers can be imported.
        // This comes across for things like the swift bridging header (ProductModuleName-Swift.h)
        // Which can be imported in the app as #import "Blah-Swift.h", but the same import fails
        // if you change the target into a framework
        //
        // We should probably research why this is, but for now I'm just adding a framework's public
        // headers to its own search path. This seems to resolve the issue.
        const newPath = "$(BUILT_PRODUCTS_DIR)/$(CONTENTS_FOLDER_PATH)/Headers";
        if (buildSettings["HEADER_SEARCH_PATHS"] instanceof Array) {
            buildSettings["HEADER_SEARCH_PATHS"].push(newPath);
        }
        else {
            buildSettings["HEADER_SEARCH_PATHS"] = newPath;
        }
    }
    patchBuildConfigValuesForTarget(target, filePathPrefix) {
        const buildConfigList = target.buildConfigurationList();
        for (const buildConfig of buildConfigList.buildConfigs()) {
            const buildSettings = buildConfig.buildSettings();
            if (buildSettings["MODULEMAP_FILE"]) {
                buildSettings["MODULEMAP_FILE"] = this.patchPath(buildSettings["MODULEMAP_FILE"], filePathPrefix);
            }
            if (buildSettings["PODS_ROOT"]) {
                buildSettings["PODS_ROOT"] = this.patchPath(buildSettings["PODS_ROOT"], filePathPrefix);
            }
            if (buildSettings["PODS_PODFILE_DIR_PATH"]) {
                buildSettings["PODS_PODFILE_DIR_PATH"] = this.patchPath(buildSettings["PODS_PODFILE_DIR_PATH"], filePathPrefix);
            }
            if (buildSettings["GCC_PREFIX_HEADER"]) {
                buildSettings["GCC_PREFIX_HEADER"] = this.patchPath(buildSettings["GCC_PREFIX_HEADER"], filePathPrefix);
            }
            if (buildSettings["FRAMEWORK_SEARCH_PATHS"]) {
                if (buildSettings["FRAMEWORK_SEARCH_PATHS"] instanceof Array) {
                    buildSettings["FRAMEWORK_SEARCH_PATHS"] = buildSettings["FRAMEWORK_SEARCH_PATHS"].map((path) => {
                        return path.replace(/\$\(PROJECT_DIR\)/g, "$(PROJECT_DIR)/" + filePathPrefix);
                    });
                }
                else {
                    buildSettings["FRAMEWORK_SEARCH_PATHS"] = buildSettings["FRAMEWORK_SEARCH_PATHS"].replace(/\$\(PROJECT_DIR\)/g, "$(PROJECT_DIR)/" + filePathPrefix);
                }
            }
            if (buildSettings["CODE_SIGN_ENTITLEMENTS"]) {
                buildSettings["CODE_SIGN_ENTITLEMENTS"] = this.patchPath(buildSettings["CODE_SIGN_ENTITLEMENTS"], filePathPrefix);
            }
            if (buildSettings["SYMROOT"]) {
                buildSettings["SYMROOT"] = this.patchPath(buildSettings["SYMROOT"], filePathPrefix);
            }
            if (buildSettings["SWIFT_OBJC_BRIDGING_HEADER"]) {
                buildSettings["SWIFT_OBJC_BRIDGING_HEADER"] =
                    filePathPrefix + "/" + buildSettings["SWIFT_OBJC_BRIDGING_HEADER"];
            }
            if (buildSettings["INFOPLIST_FILE"]) {
                this.patchInfoPlist(buildSettings["INFOPLIST_FILE"], filePathPrefix, buildConfig);
            }
        }
    }
    patchBuildPaths(target, filePathPrefix) {
        // Patch up the build paths to be correct
        for (const buildPhase of target.buildPhases()) {
            if (buildPhase.isa() === "PBXShellScriptBuildPhase") {
                buildPhase.setInputPaths(buildPhase.inputPaths().map((path) => {
                    return path.replace("$(SRCROOT)", "$(SRCROOT)/" + filePathPrefix);
                }));
                buildPhase.setShellScript(buildPhase
                    .shellScript()
                    .replace(/\$\(SRCROOT\)/g, "$(SRCROOT)/" + filePathPrefix)
                    .replace(/\$SRCROOT/g, "$SRCROOT/" + filePathPrefix)
                    .replace(/\$\(SOURCE_ROOT\)/g, "$(SOURCE_ROOT)/" + filePathPrefix)
                    .replace(/\$SOURCE_ROOT/g, "$SOURCE_ROOT/" + filePathPrefix)
                    .replace(/\$\{PROJECT_DIR\}/g, "${PROJECT_DIR}/" + filePathPrefix));
            }
        }
    }
    copyOtherObjectsIntoSelf(other, filePathPrefix) {
        const otherRootObjID = other._defn["rootObject"];
        // Note: this does create some orphaned nodes, xcode seems to ignore them, so I'm fine
        // with it for now - eventually we should clean it up
        for (const id in other._defn["objects"]) {
            if (id in this._defn["objects"]) {
                // TODO: This will become a shoddy assumption soon, b/c if we're merging different
                // versions of the same project, it WILL have the same UUIDs; we should
                // prolly have some way to rename them and replace the UUIDs
                throw Error("Duplicate UUIDs detected ('" +
                    id +
                    "')! Are you trying to merge a file into itself?");
            }
            // Skip the main group, that's a PBXProject, and while xcode doesn't seem to care if
            // we have two, we don't have any use for it as an orphan node in the objects tree
            if (id === otherRootObjID) {
                continue;
            }
            this._defn["objects"][id] = utils_1.deepCopy(other._defn["objects"][id]);
            // patch path as need be
            if ((this._defn["objects"][id]["isa"] === "PBXFileReference" ||
                this._defn["objects"][id]["isa"] === "PBXGroup") &&
                this._defn["objects"][id]["sourceTree"] === "SOURCE_ROOT") {
                if (this._defn["objects"][id]["path"]) {
                    this._defn["objects"][id]["path"] =
                        filePathPrefix + "/" + this._defn["objects"][id]["path"];
                }
            }
        }
    }
    patchMergedAppTarget(target, frameworkStepId) {
        // Update app to be framework
        target.setProductType("com.apple.product-type.framework");
        const productTarget = target.product();
        productTarget.set("name", productTarget.get("name") || productTarget.get("path"));
        productTarget.set("explicitFileType", "wrapper.framework");
        // Add as a framework to the main project
        const buildFileId = utils_1.generateUUID(Object.keys(this._defn["objects"]));
        this._defn["objects"][buildFileId] = {
            isa: "PBXBuildFile",
            fileRef: productTarget._id,
            settings: {
                ATTRIBUTES: ["CodeSignOnCopy", "RemoveHeadersOnCopy"],
            },
        };
        this._defn["objects"][frameworkStepId]["files"].push(buildFileId);
        // Not worth trying to rename the path, shared xcschemes seem to override this
        // (for example, even if we set it to *.framework, when xcode opens the wikipedia
        // example, it will rename it to Wikipedia.app)
        //
        // Beyond that, some tests seem to assume this is the build directory
        //
        // ALSO, earlier in the function that calls this one, we call another function which
        // reads the path and uses it to set the rpath of the framework
        const originalPath = productTarget.get("path");
        const pathParts = originalPath.split(".");
        pathParts.pop();
        const frameworkNameRaw = pathParts.join(".");
        // TODO: I should probably understand how the actual path for the dylib is computed,
        // but for now this seems to be working
        return {
            frameworkName: originalPath,
            frameworkExecutableName: frameworkNameRaw,
        };
    }
    patchMergedTarget(target, filePathPrefix) {
        // TODO: This is a nasty hack so that the xcode file doesn't show as corrupted,
        // some leaf nodes have to have a pointer back to the root of the tree
        for (const dependency of target.dependencies()) {
            if (dependency.isa() === "PBXTargetDependency") {
                dependency.targetProxy().setContainerPortal(this.rootObject());
            }
        }
        this.patchBuildPaths(target, filePathPrefix);
        this.patchBuildConfigValuesForTarget(target, filePathPrefix);
    }
    mergeTargets(other, newMainGroup, filePathPrefix) {
        const appTargets = [];
        this.copyOtherObjectsIntoSelf(other, filePathPrefix);
        // Update OUR object to point to the embedded app as a new group
        const otherMainGroup = other.rootObject().mainGroup().updateProj(this);
        newMainGroup.addChildren(otherMainGroup.children());
        otherMainGroup.remove();
        // Note: this kinda relies on an abstraction leak, as those objects we're
        // "Adding" are grounded in a separate product, but their ID has been
        // duplicated into our project, so this works fine for now
        this.rootObject().addTargets(other.rootObject().targets());
        for (const target of other.rootObject().targets()) {
            target.updateProj(this);
            this.patchMergedTarget(target, filePathPrefix);
            if (target.productType() === "com.apple.product-type.application") {
                appTargets.push(target);
            }
        }
        return appTargets;
    }
    convertAppToFramework(target, filePathPrefix, frameworkStepId) {
        const frameworkInfo = this.patchMergedAppTarget(target, frameworkStepId);
        const buildConfigList = target.buildConfigurationList();
        const defaultConfigurationName = buildConfigList.defaultConfigurationName();
        let defaultBuildConfigDetails = null;
        for (const buildConfig of buildConfigList.buildConfigs()) {
            const buildSettings = buildConfig.buildSettings();
            this.patchHeaderSearchPathsForApp(buildSettings);
            if (!buildSettings["WRAPPER_EXTENSION"]) {
                buildSettings["WRAPPER_EXTENSION"] = "app";
            }
            const searchPaths = buildSettings["LD_RUNPATH_SEARCH_PATHS"];
            if (searchPaths instanceof Array) {
                if (!searchPaths.includes("@executable_path/Frameworks")) {
                    throw Error("Error! App runtime search paths don't include frameworks. This may indicate something is about to break.");
                }
                buildSettings["LD_RUNPATH_SEARCH_PATHS"] = searchPaths.map((path) => {
                    if (path === "@executable_path/Frameworks") {
                        return ("@executable_path/Frameworks/" +
                            target.product().get("path") +
                            "/Frameworks");
                    }
                    return path;
                });
            }
            else if (typeof searchPaths === "string") {
                if (!searchPaths.includes("@executable_path/Frameworks")) {
                    throw Error("Error! App runtime search paths don't include frameworks. This may indicate something is about to break.");
                }
                buildSettings["LD_RUNPATH_SEARCH_PATHS"] = searchPaths.replace("@executable_path/Frameworks", "@executable_path/Frameworks/" +
                    target.product().get("path") +
                    "/Frameworks");
            }
            else {
                throw Error("Error! App runtime search paths are some undefined type (or simply undefined). This is not expected!");
            }
            if (defaultConfigurationName === buildConfig.name()) {
                const plist = buildSettings["INFOPLIST_FILE"].replace("$(SRCROOT)", this._srcRoot);
                const bundleId = buildSettings["PRODUCT_BUNDLE_IDENTIFIER"];
                // Note: right now we only need to code sign entitlements to get this to work,
                // but eventually we may want to move other things here (specifically,
                // DEVELOPMENT_TEAM and CODE_SIGN_IDENTITY)
                const entitlements = buildSettings["CODE_SIGN_ENTITLEMENTS"];
                defaultBuildConfigDetails = {
                    plist,
                    bundleId,
                    entitlements,
                    baseConfigurationReference: buildConfig.get("baseConfigurationReference"),
                    // TODO: we need to extract the build settings, likely we can do this by
                    // looking through the list of all xcode build settings (i.e. scraping
                    // https://xcodebuildsettings.com/, recommended by https://nshipster.com/xcconfig/)
                    // and then pulling out the non-canonical ones
                    customBuildSettings: {},
                };
            }
        }
        if (!defaultBuildConfigDetails) {
            throw Error("Error! No default config found!");
        }
        return {
            frameworkName: frameworkInfo.frameworkName,
            frameworkExecutableName: frameworkInfo.frameworkExecutableName,
            plist: defaultBuildConfigDetails.plist,
            bundleId: defaultBuildConfigDetails.bundleId,
            entitlements: defaultBuildConfigDetails.entitlements,
            baseConfigurationReference: defaultBuildConfigDetails.baseConfigurationReference,
            customBuildSettings: defaultBuildConfigDetails.customBuildSettings,
        };
    }
    extractMarketingAppIcon(buildSettings, target) {
        // Get app icon name
        const appIconName = buildSettings.get("ASSETCATALOG_COMPILER_APPICON_NAME");
        // Find asset catalogs
        const potentialAppIcons = [];
        target.buildPhases().forEach((buildPhase) => {
            if (buildPhase.isa() === "PBXResourcesBuildPhase") {
                buildPhase.get("files").forEach((fileId) => {
                    const buildFile = new pbx_build_file_1.default(fileId, this, null);
                    const file = buildFile.fileRef();
                    if (file.get("lastKnownFileType") === "folder.assetcatalog") {
                        const appIconPath = path.join(file.fullPath(), `${appIconName}.appiconset`);
                        if (fs_extra_1.default.existsSync(appIconPath)) {
                            potentialAppIcons.push(appIconPath);
                        }
                    }
                });
            }
        });
        if (potentialAppIcons.length == 0) {
            return null;
        }
        // Order lexigraphically - xcode seems to search them in this order
        potentialAppIcons.sort();
        // Get larget icon
        const rawContents = fs_extra_1.default.readFileSync(path.join(potentialAppIcons[0], "Contents.json"));
        const contents = JSON.parse(rawContents.toString());
        for (const imageMetadata of contents["images"]) {
            if (imageMetadata["idiom"] === "ios-marketing" &&
                imageMetadata["filename"]) {
                return path.join(potentialAppIcons[0], imageMetadata["filename"]);
            }
        }
        return null;
    }
    extractAppName(buildSettings) {
        // Get name from info plist
        const plist = plist_1.Plist.fromFile(path.isAbsolute(buildSettings.fetch("INFOPLIST_FILE"))
            ? buildSettings.fetch("INFOPLIST_FILE")
            : path.join(this._srcRoot, buildSettings.fetch("INFOPLIST_FILE")));
        let name = plist.get("CFBundleDisplayName") || plist.get("CFBundleName");
        // interpolate in build settings values
        const expandBuildSettings = buildSettings.get("INFOPLIST_EXPAND_BUILD_SETTINGS");
        if (expandBuildSettings && expandBuildSettings !== "NO") {
            name = buildSettings.expand(name);
        }
        return name;
    }
    duplicateBuildConfig(buildConfig, project) {
        const newObjID = utils_1.generateUUID(project.allObjectKeys());
        const newObj = {};
        Object.keys(buildConfig._defn).forEach((key) => {
            newObj[key] = utils_1.deepCopy(buildConfig._defn[key]);
        });
        project._defn["objects"][newObjID] = newObj;
        return new pbx_build_config_1.default(newObjID, project);
    }
    duplicateBuildConfigList(buildConfigList, project) {
        const newObjID = utils_1.generateUUID(project.allObjectKeys());
        const newObj = {};
        Object.keys(buildConfigList._defn).forEach((key) => {
            if (key === "buildConfigurations") {
                newObj[key] = buildConfigList._defn[key].map((buildConfigId) => {
                    return this.duplicateBuildConfig(new pbx_build_config_1.default(buildConfigId, this), project)._id;
                });
            }
            else {
                newObj[key] = utils_1.deepCopy(buildConfigList._defn[key]);
            }
        });
        project._defn["objects"][newObjID] = newObj;
        return new pbx_build_config_list_1.default(newObjID, project);
    }
    getTargetWithName(name, mustBeAppTarget) {
        const candidates = this.rootObject()
            .targets()
            .filter((target) => {
            return (target.name() === name &&
                (!mustBeAppTarget ||
                    target.productType() === "com.apple.product-type.application"));
        });
        if (candidates.length > 1) {
            console.log(chalk_1.default.yellow("Multiple targets detected for one name: " + name));
        }
        return candidates[0] || null;
    }
    addEntitlementsToBuildConfig(file, buildConfigId, baseConfigId, buildSettings) {
        const buildConfig = new pbx_build_config_1.default(buildConfigId, this);
        buildConfig.set("baseConfigurationReference", baseConfigId);
        buildConfig.buildSettings()["CODE_SIGN_ENTITLEMENTS"] = file;
        buildConfig.overrideBuildSettings(Object.assign(Object.assign({}, buildSettings), buildConfig.buildSettings()));
    }
    createGroup(name, path) {
        const uuid = utils_1.generateUUID(Object.keys(this._defn["objects"]));
        this._defn["objects"][uuid] = {
            path: path || name,
            name: name,
            isa: "PBXGroup",
            children: [],
            sourceTree: "<group>",
        };
        const child = new pbx_group_1.default(uuid, this);
        return child;
    }
    containsNode(id) {
        return id in this._defn["objects"];
    }
    deepDuplicate(id, forceDuplicate) {
        return this.deepDuplicateInternal(id, {}, forceDuplicate);
    }
    deepDuplicateInternal(id, reboundKeys, forceDuplicate) {
        // before all else, check reboundKeys
        if (id in reboundKeys) {
            return reboundKeys[id];
        }
        const obj = this._defn["objects"][id];
        if (!obj) {
            console.log(chalk_1.default.yellow(`PBX Object with id: ${id} referenced but not present. Skipping in deep copy`));
            return id;
        }
        const isa = obj["isa"];
        // For some keys, they are meant to be single records, so don't worry about
        // copying them. Instead just bind them as is.
        if ([
            "PBXProject",
            "PBXFileReference",
            "PBXGroup",
            "PBXVariantGroup",
            "XCVersionGroup",
        ].includes(isa) &&
            !forceDuplicate) {
            return id;
        }
        const objCopyId = utils_1.generateUUID(this.allObjectKeys().concat(Object.values(reboundKeys)));
        reboundKeys[id] = objCopyId;
        // rebind children
        const objCopy = utils_1.deepCopy(obj);
        const potentialKey = (value, conservative) => {
            // Cocoapods seems to use 32char IDs (xcode uses 24)
            const keyMatch = /^[A-Z0-9]{24,32}$/;
            return ((value instanceof Array &&
                (value.length > 0 || !conservative) &&
                value.every((v) => keyMatch.test(v))) ||
                (typeof value === "string" && keyMatch.test(value)));
        };
        Object.keys(objCopy).forEach((objectKey) => {
            const objectValue = objCopy[objectKey];
            if (isa === "PBXTargetDependency" &&
                ["target", "targetProxy"].includes(objectKey)) {
                // Intentionally skipping these b/c they're
                // not meant to be copied
            }
            else if ((isa === "PBXProject" &&
                [
                    "buildConfigurationList",
                    "mainGroup",
                    "productRefGroup",
                    "targets",
                ].includes(objectKey)) ||
                (isa === "PBXGroup" && ["children"].includes(objectKey)) ||
                (isa === "PBXContainerItemProxy" &&
                    ["containerPortal", "remoteGlobalIDString"].includes(objectKey)) ||
                (isa === "PBXNativeTarget" &&
                    [
                        "buildConfigurationList",
                        "buildPhases",
                        "productReference",
                        "dependencies",
                        "buildRules",
                        "packageProductDependencies",
                    ].includes(objectKey)) ||
                (isa === "PBXTargetDependency" &&
                    ["targetProxy"].includes(objectKey)) ||
                (isa === "XCConfigurationList" &&
                    ["buildConfigurations"].includes(objectKey)) ||
                (isa === "XCSwiftPackageProductDependency" &&
                    ["package"].includes(objectKey)) ||
                (isa === "PBXBuildFile" &&
                    ["fileRef", "productRef"].includes(objectKey)) ||
                (isa === "PBXFrameworksBuildPhase" && ["file"].includes(objectKey)) ||
                (isa === "PBXSourcesBuildPhase" && ["files"].includes(objectKey)) ||
                (isa === "PBXResourcesBuildPhase" && ["files"].includes(objectKey)) ||
                (isa === "PBXCopyFilesBuildPhase" && ["files"].includes(objectKey)) ||
                (isa === "PBXReferenceProxy" && ["remoteRef"].includes(objectKey)) ||
                (isa === "PBXAggregateTarget" &&
                    ["buildConfigurationList"].includes(objectKey)) ||
                (isa === "XCVersionGroup" &&
                    ["currentVersion", "children"].includes(objectKey)) ||
                (isa === "PBXFrameworksBuildPhase" && ["files"].includes(objectKey)) ||
                (isa === "XCBuildConfiguration" &&
                    ["baseConfigurationReference"].includes(objectKey)) ||
                (isa === "PBXVariantGroup" && ["children"].includes(objectKey)) ||
                (isa === "PBXShellScriptBuildPhase" && ["files"].includes(objectKey)) ||
                (isa === "PBXHeadersBuildPhase" && ["files"].includes(objectKey))) {
                if (!potentialKey(objectValue, false)) {
                    console.log(chalk_1.default.yellow(`Potential overzelous key match during key replacement! "${objectValue}" ("${objectKey}" in "${isa}")`));
                }
                if (objCopy[objectKey] instanceof Array) {
                    objCopy[objectKey] = objectValue.map((key) => {
                        return this.deepDuplicateInternal(key, reboundKeys);
                    });
                }
                else {
                    objCopy[objectKey] = this.deepDuplicateInternal(objectValue, reboundKeys);
                }
            }
            else if (potentialKey(objectValue, true)) {
                console.log(chalk_1.default.yellow(`Potential missed key during key replacement! "${objectValue}" ("${objectKey}" in "${isa}")`));
            }
        });
        this._defn["objects"][objCopyId] = objCopy;
        return objCopyId;
    }
    allObjectKeys() {
        return Object.keys(this._defn["objects"]);
    }
}
exports.default = PBXProj;
//# sourceMappingURL=pbx_project.js.map