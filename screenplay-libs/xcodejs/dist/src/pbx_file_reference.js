"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const pbx_group_1 = __importDefault(require("./pbx_group"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
const utils_1 = require("./utils");
function findParents(id, group) {
    for (const child of group.children()) {
        if (child._id === id) {
            return [group];
        }
        else if (["PBXGroup", "XCVersionGroup", "PBXVariantGroup"].includes(child.isa())) {
            const foundPath = findParents(id, new pbx_group_1.default(child._id, child._proj));
            if (foundPath !== null) {
                return [group].concat(foundPath);
            }
        }
    }
    return null;
}
const DEFAULTS = {
    isa: "PBXFileReference",
    lastKnownFileType: "wrapper.framework",
    sourceTree: "<group>",
};
class PBXFileReference extends pbx_object_1.default {
    constructor(id, proj, data = null) {
        super(id, proj, data);
    }
    static createFromFrameworkPath(frameworkPath, proj) {
        return new PBXFileReference(utils_1.generateUUID([]), proj, Object.assign(Object.assign({}, DEFAULTS), { name: path_1.default.basename(frameworkPath), path: frameworkPath }));
    }
    static createFromAbsolutePath(filePath, fileType, proj) {
        return new PBXFileReference(utils_1.generateUUID([]), proj, Object.assign(Object.assign({}, DEFAULTS), { name: path_1.default.basename(filePath), path: filePath, lastKnownFileType: fileType, sourceTree: "<absolute>" }));
    }
    path() {
        return this._defn["path"];
    }
    fullPath() {
        const parents = findParents(this._id, this._proj.rootObject().mainGroup());
        if (parents === null) {
            throw ("Xcodejs ERROR! Child (" + this._id + ") could not be found in tree!");
        }
        // TODO this assumes relative paths up the tree
        return path_1.default.join(this._proj._srcRoot, path_1.default.join(...parents.map((ancestor) => {
            return ancestor.path() || "";
        })), this.path());
    }
}
exports.default = PBXFileReference;
//# sourceMappingURL=pbx_file_reference.js.map