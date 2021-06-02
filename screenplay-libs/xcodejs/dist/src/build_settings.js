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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class BuildSettings {
    constructor(defn) {
        this._defn = defn;
    }
    static loadFromFile(filePath) {
        return new BuildSettings(JSON.parse(fs.readFileSync(filePath).toString()));
    }
    writeToFile(filePath) {
        fs.writeFileSync(filePath, JSON.stringify(this._defn, null, 2));
    }
    get(key) {
        return this._defn[key];
    }
    applyOperation(operation, value) {
        /*
         * TODO: At some point we should implement all the various build phase
         * operations (best documented here: https://github.com/facebook/xcbuild/blob/4b96d137af8b8397b9cc6cd341e3aed51833365f/Libraries/pbxsetting/Sources/Environment.cpp#L34-L113)
         * However, bitrise seems to not and it's fine: https://github.com/bitrise-io/xcode-project/blob/09e5737e052d9d01cb927e53e18c378868377414/xcodeproj/xcodeproj.go#L222
         */
        return value;
    }
    expand(value) {
        return value.replace(/\$(\(([^)]+)\)|\{([^}]+)\})/g, (match, _, parenSetting, bracketSetting) => {
            const setting = parenSetting || bracketSetting;
            const tokens = setting.split(":");
            let value = this.fetchOrUndefined(tokens.shift()) || "";
            for (const token of tokens) {
                value = this.applyOperation(token, value);
            }
            return value;
        });
    }
    fetch(key) {
        const value = this._defn[key];
        if (!value) {
            throw new Error(`No value for "${key}" found in build settings`);
        }
        return value;
    }
    fetchOrUndefined(key) {
        return this._defn[key];
    }
    get objectFilesDir() {
        return this.fetch("OBJECT_FILE_DIR_normal");
    }
    get installName() {
        return `@rpath/${this.fetch("CONTENTS_FOLDER_PATH")}/${this.executableName}`;
    }
    get tempDir() {
        return this.fetch("TEMP_DIR");
    }
    get infoplistFile() {
        return this.fetch("INFOPLIST_FILE");
    }
    get entitlementsFile() {
        return this.fetchOrUndefined("CODE_SIGN_ENTITLEMENTS");
    }
    get srcRoot() {
        return this.fetch("SRCROOT");
    }
    get executableName() {
        return this.fetch("EXECUTABLE_NAME");
    }
    get configuration() {
        return this.fetch("CONFIGURATION");
    }
    get screenplaySemVer() {
        return this.fetch("SCREENPLAY_SEMVER");
    }
    get productModuleName() {
        return this.fetch("PRODUCT_MODULE_NAME");
    }
    get unversionedProductModuleName() {
        try {
            return this.productModuleName.match(/(.*)_v(\d|undefined)/)[1];
        }
        catch (err) {
            console.error(`Failed to extract unversioned product module from ${this.productModuleName}`);
            throw err;
        }
    }
    get executablePath() {
        return this.fetch("EXECUTABLE_PATH");
    }
    get archs() {
        return this.fetch("ARCHS");
    }
    get sdkRoot() {
        return this.fetch("SDKROOT");
    }
    get sdkVersion() {
        return this.fetch("SDK_VERSION");
    }
    get correspondingDeviceSDKDir() {
        return this.fetch("CORRESPONDING_DEVICE_SDK_DIR");
    }
    get librarySearchPaths() {
        return this.fetch("LIBRARY_SEARCH_PATHS");
    }
    get testLibrarySearchPaths() {
        return this.fetch("TEST_LIBRARY_SEARCH_PATHS");
    }
    get frameworkSearchPaths() {
        return this.fetch("FRAMEWORK_SEARCH_PATHS");
    }
    get testFrameworkSearchPaths() {
        return this.fetch("TEST_FRAMEWORK_SEARCH_PATHS");
    }
    get ldRunpathSearchPaths() {
        return this.fetch("LD_RUNPATH_SEARCH_PATHS");
    }
    get linkTarget() {
        return `${this.fetch("NATIVE_ARCH")}-${this.fetch("LLVM_TARGET_TRIPLE_VENDOR")}-${this.fetch("LLVM_TARGET_TRIPLE_OS_VERSION")}${this.fetch("LLVM_TARGET_TRIPLE_SUFFIX") || "" // Builds targeting "any" have no suffix, simulator builds for example do.
        }`;
    }
    get marketingVersion() {
        return this.fetch("MARKETING_VERSION");
    }
    get astPath() {
        return `${this.fetch("NATIVE_ARCH")}-${this.fetch("LLVM_TARGET_TRIPLE_VENDOR")}-${this.fetch("LLVM_TARGET_TRIPLE_OS_VERSION")}${this.fetch("LLVM_TARGET_TRIPLE_SUFFIX")}`;
    }
    get targetName() {
        return this.fetch("TARGET_NAME");
    }
    get unlocalizedResourcesFolderPath() {
        return this.fetch("UNLOCALIZED_RESOURCES_FOLDER_PATH");
    }
    get targetBuildDir() {
        return this.fetch("TARGET_BUILD_DIR");
    }
    get fatFrameworkPath() {
        return path.join(this.targetBuildDir, this.fetch("EXECUTABLE_PATH"));
    }
    get fatFrameworkDirPath() {
        return path.join(this.targetBuildDir, this.fetch("EXECUTABLE_FOLDER_PATH"));
    }
    get executableFolderPath() {
        return this.fetch("EXECUTABLE_FOLDER_PATH");
    }
}
exports.default = BuildSettings;
//# sourceMappingURL=build_settings.js.map