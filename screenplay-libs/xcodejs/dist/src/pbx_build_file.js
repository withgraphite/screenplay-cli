"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_file_reference_1 = __importDefault(require("./pbx_file_reference"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
const utils_1 = require("./utils");
const DEFAULTS = {
    isa: "PBXBuildFile",
    settings: { ATTRIBUTES: ["RemoveHeadersOnCopy", "CodeSignOnCopy"] },
};
class PBXBuildFile extends pbx_object_1.default {
    constructor(id, proj, data) {
        super(id, proj, data);
    }
    static createFromFramework(fileRef, proj) {
        return new PBXBuildFile(utils_1.generateUUID([]), proj, Object.assign(Object.assign({}, DEFAULTS), { fileRef: fileRef._id }));
    }
    path() {
        return this._defn["path"];
    }
    setPath(path) {
        this._defn["path"] = path;
    }
    addChild(child) {
        this.addChildren([child]);
    }
    children() {
        return this._defn["children"].map((childId) => {
            return new pbx_object_1.default(childId, this._proj);
        });
    }
    fileRef() {
        return new pbx_file_reference_1.default(this._defn["fileRef"], this._proj);
    }
    addChildren(children) {
        this._defn["children"] = this._defn["children"].concat(children.map((child) => child._id));
    }
}
exports.default = PBXBuildFile;
//# sourceMappingURL=pbx_build_file.js.map