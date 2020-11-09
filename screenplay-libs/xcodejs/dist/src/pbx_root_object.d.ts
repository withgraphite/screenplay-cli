import PBXBuildConfigList from "./pbx_build_config_list";
import PBXGroup from "./pbx_group";
import PBXNativeTarget from "./pbx_native_target";
import PBXObject from "./pbx_object";
export default class PBXRootObject extends PBXObject {
    targets(): ReadonlyArray<PBXNativeTarget>;
    applicationTargets(): ReadonlyArray<PBXNativeTarget>;
    removeTarget(target: PBXNativeTarget): void;
    setTargets(newTargets: PBXNativeTarget[]): void;
    addTargets(targets: ReadonlyArray<PBXNativeTarget>): void;
    buildConfigurationList(): PBXBuildConfigList;
    mainGroup(): PBXGroup;
}
