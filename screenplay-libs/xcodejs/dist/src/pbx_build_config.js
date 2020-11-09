"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_file_reference_1 = __importDefault(require("./pbx_file_reference"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXBuildConfig extends pbx_object_1.default {
    buildSettings() {
        return this._defn["buildSettings"];
    }
    overrideBuildSettings(value) {
        this._defn["buildSettings"] = value;
    }
    name() {
        return this._defn["name"];
    }
    isa() {
        return this._defn["isa"];
    }
    baseConfigurationReference() {
        if (this._defn["baseConfigurationReference"]) {
            return new pbx_file_reference_1.default(this._defn["baseConfigurationReference"], this._proj);
        }
        return null;
    }
}
exports.default = PBXBuildConfig;
//# sourceMappingURL=pbx_build_config.js.map