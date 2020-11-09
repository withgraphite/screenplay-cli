"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXGroup extends pbx_object_1.default {
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
    addChildren(children) {
        this._defn["children"] = this._defn["children"].concat(children.map((child) => child._id));
    }
}
exports.default = PBXGroup;
//# sourceMappingURL=pbx_group.js.map