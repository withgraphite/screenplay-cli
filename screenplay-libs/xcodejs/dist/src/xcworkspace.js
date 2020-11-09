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
exports.XCWorkspace = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const xml_js_1 = __importDefault(require("xml-js"));
class XCWorkspace {
    constructor(defn, path) {
        this._defn = defn;
        this._path = path;
    }
    allFiles() {
        return this._defn["Workspace"]["FileRef"].map((fileRef) => {
            if (!fileRef._attributes.location.startsWith("group:")) {
                console.log(chalk_1.default.yellow("Error! Unknown format, XCWorkspace file ref does not start with 'group:'"));
            }
            return fileRef._attributes.location.slice(6);
        });
    }
    updateLocation(oldLocation, newLocation) {
        this._defn["Workspace"]["FileRef"]
            .filter((fileRef) => fileRef._attributes.location === `group:${oldLocation}`)
            .map((fileRef) => (fileRef._attributes.location = `group:${newLocation}`));
    }
    static fromFile(filePath) {
        if (path_1.default.basename(filePath) !== "contents.xcworkspacedata") {
            throw new Error(`Cannot load XCWorkspace from filePath ${filePath}`);
        }
        const data = fs.readFileSync(filePath);
        const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
        return new XCWorkspace(defn, filePath);
    }
    save() {
        fs.writeFileSync(this._path, xml_js_1.default.js2xml(this._defn, { compact: true }));
    }
}
exports.XCWorkspace = XCWorkspace;
//# sourceMappingURL=xcworkspace.js.map