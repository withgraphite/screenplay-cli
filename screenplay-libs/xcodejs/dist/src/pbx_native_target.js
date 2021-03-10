"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbx_build_config_list_1 = __importDefault(require("./pbx_build_config_list"));
const pbx_build_phase_1 = __importDefault(require("./pbx_build_phase"));
const pbx_object_1 = __importDefault(require("./pbx_object"));
const pbx_target_dependency_1 = __importDefault(require("./pbx_target_dependency"));
class PBXNativeTarget extends pbx_object_1.default {
    toString() {
        return this.get("name");
    }
    productType() {
        return this._defn["productType"];
    }
    setProductType(productType) {
        this._defn["productType"] = productType;
    }
    addBuildPhase(buildPhase) {
        this._defn["buildPhases"].push(buildPhase._id);
    }
    product() {
        return new pbx_object_1.default(this._defn["productReference"], this._proj);
    }
    setProduct(value) {
        return this.set("productReference", value);
    }
    name() {
        return this._defn["name"];
    }
    dependencies() {
        return (this._defn["dependencies"] || []).map((dependencyId) => {
            return new pbx_target_dependency_1.default(dependencyId, this._proj);
        });
    }
    buildConfigurationList() {
        return new pbx_build_config_list_1.default(this._defn["buildConfigurationList"], this._proj);
    }
    buildConfiguration(name) {
        const config = this.buildConfigurationList()
            .buildConfigs()
            .find((config) => config.name() == name);
        if (!config) {
            throw Error(`Failed to find build configuration ${name}`);
        }
        return config;
    }
    defaultConfigurationName() {
        return this._defn["defaultConfigurationName"];
    }
    buildPhases() {
        return this._defn["buildPhases"].map((buildPhaseId) => {
            return new pbx_build_phase_1.default(buildPhaseId, this._proj);
        });
    }
}
exports.default = PBXNativeTarget;
//# sourceMappingURL=pbx_native_target.js.map