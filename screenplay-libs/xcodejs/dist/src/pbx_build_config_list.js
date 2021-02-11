"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_build_config_1 = __importDefault(require("./pbx_build_config"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
class PBXBuildConfigList extends pbx_object_1.default {
    defaultConfigurationName() {
        return this._defn["defaultConfigurationName"];
    }
    defaultConfig() {
        const defaultName = this.defaultConfigurationName();
        return this.buildConfigs().filter((config) => config.name() == defaultName)[0];
    }
    buildConfigs() {
        return this._defn["buildConfigurations"].map((buildConfigId) => {
            return new pbx_build_config_1.default(buildConfigId, this._proj);
        });
    }
    setValueForAll(key, value) {
        const appTargetBuildConfigs = this.buildConfigs();
        for (const buildConfig of appTargetBuildConfigs) {
            buildConfig.buildSettings()[key] = value;
        }
    }
}
exports.default = PBXBuildConfigList;
//# sourceMappingURL=pbx_build_config_list.js.map