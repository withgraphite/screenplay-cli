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
exports.XCConfig = void 0;
const fs = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const XCCONFIG_VAR_ASSIGNMENT = /(.*?) = (.*);?/;
const XCCONFIG_INCLUDE = /#include(\??) "(.*)"/;
class XCConfig {
    constructor(defn, path) {
        this._defn = defn;
        this._path = path;
    }
    static fromFile(file) {
        const data = fs.readFileSync(file);
        let defn = {};
        data
            .toString()
            .split("\n")
            .forEach((line) => {
            if (line.trim().length === 0 || line.startsWith("//")) {
                return;
            }
            else if (line.startsWith("#include")) {
                const includeParse = XCCONFIG_INCLUDE.exec(line);
                if (includeParse === null) {
                    throw Error("Error! Not-understood include statement: '" + line + "'");
                }
                const includeFilePath = path_1.default.join(path_1.default.dirname(file), includeParse[2]);
                if (!fs.existsSync(includeFilePath)) {
                    if (includeParse[1] !== "?") {
                        throw Error("Error! Missing include: " + includeFilePath);
                    }
                }
                else {
                    const subFile = XCConfig.fromFile(includeFilePath);
                    defn = Object.assign(Object.assign({}, defn), subFile.values());
                }
            }
            else {
                const variableAssignment = XCCONFIG_VAR_ASSIGNMENT.exec(line);
                if (variableAssignment === null) {
                    throw Error(`Error! Not-understood line in xconfig (${file}): "${line}"`);
                }
                defn[variableAssignment[1]] = variableAssignment[2];
            }
        });
        return new XCConfig(defn, file);
    }
    values() {
        return this._defn;
    }
}
exports.XCConfig = XCConfig;
//# sourceMappingURL=xcconfig.js.map