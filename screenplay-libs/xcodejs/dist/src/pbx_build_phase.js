"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXBuildPhase extends pbx_object_1.default {
    inputPaths() {
        return this._defn["inputPaths"];
    }
    addFile(file) {
        if (this.isa() != "PBXResourcesBuildPhase") {
            throw new Error(`Cant add files to buildPhase of type ${this.isa()}`);
        }
        if (!this._defn["files"]) {
            this._defn["files"] = [file._id];
        }
        else if (this._defn["files"] instanceof Array) {
            this._defn["files"].push(file._id);
        }
        else {
            throw new Error(`Could not add file to buildPhase file list of type ${typeof this._defn["files"]}`);
        }
    }
    setInputPaths(inputPaths) {
        this._defn["inputPaths"] = inputPaths;
    }
    shellScript() {
        return this._defn["shellScript"];
    }
    setShellScript(shellScript) {
        this._defn["shellScript"] = shellScript;
    }
}
exports.default = PBXBuildPhase;
//# sourceMappingURL=pbx_build_phase.js.map