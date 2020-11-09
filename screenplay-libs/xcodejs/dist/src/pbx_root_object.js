"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_build_config_list_1 = __importDefault(require("./pbx_build_config_list"));
const pbx_group_1 = __importDefault(require("./pbx_group"));
const pbx_native_target_1 = __importDefault(require("./pbx_native_target"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXRootObject extends pbx_object_1.default {
    targets() {
        return this._defn["targets"].map((targetId) => {
            return new pbx_native_target_1.default(targetId, this._proj);
        });
    }
    applicationTargets() {
        return this.targets().filter((target) => {
            return target.productType() === "com.apple.product-type.application";
        });
    }
    removeTarget(target) {
        this._defn["targets"] = this._defn["targets"].filter((targetId) => targetId !== target._id);
    }
    setTargets(newTargets) {
        this._defn["targets"] = newTargets.map((target) => target._id);
    }
    addTargets(targets) {
        this._defn["targets"] = this._defn["targets"].concat(targets.map((target) => target._id));
    }
    buildConfigurationList() {
        return new pbx_build_config_list_1.default(this._defn["buildConfigurationList"], this._proj);
    }
    mainGroup() {
        return new pbx_group_1.default(this._defn["mainGroup"], this._proj);
    }
}
exports.default = PBXRootObject;
//# sourceMappingURL=pbx_root_object.js.map