"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PBXObject {
    constructor(id, proj, data = null) {
        this._id = id;
        this._proj = proj;
        if (data != null) {
            proj._defn["objects"][id] = data;
        }
        this._defn = proj._defn["objects"][id];
    }
    get(id) {
        return this._defn[id];
    }
    set(key, value) {
        this._defn[key] = value;
    }
    remove() {
        this._proj.removeNode(this._id);
    }
    updateProj(proj) {
        this._proj = proj;
        this._defn = proj._defn["objects"][this._id];
        return this;
    }
    // convenience
    isa() {
        return this.get("isa");
    }
}
exports.default = PBXObject;
//# sourceMappingURL=pbx_object.js.map