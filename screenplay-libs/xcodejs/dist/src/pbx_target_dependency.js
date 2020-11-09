"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_object_1 = __importDefault(require("./pbx_object"));
const pbx_target_proxy_1 = __importDefault(require("./pbx_target_proxy"));
class PBXTargetDependency extends pbx_object_1.default {
    targetProxy() {
        return new pbx_target_proxy_1.default(this._defn["targetProxy"], this._proj);
    }
}
exports.default = PBXTargetDependency;
//# sourceMappingURL=pbx_target_dependency.js.map