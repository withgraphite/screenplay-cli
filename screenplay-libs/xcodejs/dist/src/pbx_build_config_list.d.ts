import PBXBuildConfig from "./pbx_build_config";
import PBXObject from "./pbx_object";
export default class PBXBuildConfigList extends PBXObject {
    defaultConfigurationName(): any;
    defaultConfig(): PBXBuildConfig;
    buildConfigs(): ReadonlyArray<PBXBuildConfig>;
}
