"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_build_phase_1 = __importDefault(require("./pbx_build_phase"));
const utils_1 = require("./utils");
const DEFAULTS = {
    isa: "PBXCopyFilesBuildPhase",
    buildActionMask: "2147483647",
    dstPath: "",
    dstSubfolderSpec: 10,
    name: "Embed Frameworks",
    runOnlyForDeploymentPostprocessing: 0,
};
class PBXCopyFilesBuildPhase extends pbx_build_phase_1.default {
    constructor(id, proj, data = null) {
        super(id, proj, data);
    }
    static createForBuildFiles(buildFiles, proj) {
        return new PBXCopyFilesBuildPhase(utils_1.generateUUID([]), proj, Object.assign(Object.assign({}, DEFAULTS), { files: buildFiles.map((file) => file._id) }));
    }
    inputPaths() {
        return this._defn["inputPaths"];
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
exports.default = PBXCopyFilesBuildPhase;
//# sourceMappingURL=pbx_copy_files_build_phase.js.map