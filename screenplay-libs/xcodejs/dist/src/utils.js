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
exports.getBundleInfoForFrameworkPath = exports.patchPath = exports.generateUUID = exports.deepCopy = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const uuid = __importStar(require("uuid"));
function deepCopy(obj) {
    // I don't like it either, but this remains one of the fastest ways to
    // deep copy an obj in JS
    return JSON.parse(JSON.stringify(obj));
}
exports.deepCopy = deepCopy;
function generateUUID(allUUIDs) {
    const id = uuid.v4().replace(/-/g, "").substr(0, 24).toUpperCase();
    if (allUUIDs.indexOf(id) >= 0) {
        return generateUUID(allUUIDs);
    }
    else {
        return id;
    }
}
exports.generateUUID = generateUUID;
function patchPath(initialPath, filePathPrefix) {
    const rootPathTokens = ["$(SRCROOT)", "$SRCROOT", "$(PROJECT_DIR)"];
    const firstComponent = initialPath.split("/")[0];
    if (rootPathTokens.indexOf(firstComponent) > -1) {
        return initialPath.replace(firstComponent, `${firstComponent}/${filePathPrefix}`);
    }
    return `${"$(SRCROOT)"}/${filePathPrefix}/${initialPath}`;
}
exports.patchPath = patchPath;
function getBundleInfoForFrameworkPath(frameworkPath) {
    const plistPath = path.join(frameworkPath, "Info.plist");
    const plistData = child_process_1.execSync("plutil -convert json -o - " + plistPath, {
        maxBuffer: 1024 * 1024 * 1024,
    });
    const plistJson = JSON.parse(plistData.toString());
    return {
        bundleIdentifier: plistJson["CFBundleIdentifier"],
        bundleName: plistJson["CFBundleName"],
        bundleExecutable: plistJson["CFBundleExecutable"],
    };
}
exports.getBundleInfoForFrameworkPath = getBundleInfoForFrameworkPath;
//# sourceMappingURL=utils.js.map