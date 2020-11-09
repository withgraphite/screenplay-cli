"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXTargetProxy extends pbx_object_1.default {
    setContainerPortal(containerPortal) {
        this._defn["containerPortal"] = containerPortal._id;
    }
}
exports.default = PBXTargetProxy;
//# sourceMappingURL=pbx_target_proxy.js.map