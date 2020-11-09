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
exports.getBuildSettingsAndTargetNameFromTarget = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class BuildSettings {
    constructor(defn) {
        this._defn = defn;
    }
    static loadFromFile(filePath) {
        return new BuildSettings(JSON.parse(fs.readFileSync(filePath).toString()));
    }
    static loadFromProject(project, target, options) {
        return getBuildSettingsAndTargetNameFromTarget(project, target, options)[0];
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
            let value = this.get(tokens.shift());
            for (let token of tokens) {
                value = this.applyOperation(token, value);
            }
            return value;
        });
    }
    buildProductsDir(baseDir) {
        const buildProductsDir = this._defn["BUILT_PRODUCTS_DIR"];
        if (!buildProductsDir) {
            throw new Error(`buildSettings must include BUILT_PRODUCTS_DIR`);
        }
        const productsPathMatches = buildProductsDir.match(/Build\/Products\/.*/);
        if (!productsPathMatches) {
            throw new Error(`unable to extract path from BUILT_PRODUCTS_DIR = ${buildProductsDir}`);
        }
        return path.join(baseDir, productsPathMatches[0]);
    }
    getFrameworkPath(buildPath) {
        return path.join(this.buildProductsDir(buildPath), this._defn["CONTENTS_FOLDER_PATH"]);
    }
}
exports.default = BuildSettings;
function getBuildSettingsAndTargetNameFromTarget(project, target, options) {
    const buildSettingsArray = JSON.parse(child_process_1.execSync(`xcodebuild -showBuildSettings -json -project "${project}" -target "${target}"`)
        .toString()
        .trim());
    if (buildSettingsArray.length !== 1) {
        console.log(chalk_1.default.yellow("Warning! Target has more than one match"));
        process.exit(1);
    }
    return [
        new BuildSettings(buildSettingsArray[0]["buildSettings"]),
        buildSettingsArray[0]["target"],
    ];
}
exports.getBuildSettingsAndTargetNameFromTarget = getBuildSettingsAndTargetNameFromTarget;
//# sourceMappingURL=build_settings.js.map