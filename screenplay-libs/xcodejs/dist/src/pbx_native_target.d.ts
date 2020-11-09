import PBXBuildConfigList from "./pbx_build_config_list";
import PBXBuildPhase from "./pbx_build_phase";
import PBXObject from "./pbx_object";
import PBXTargetDependency from "./pbx_target_dependency";
export default class PBXNativeTarget extends PBXObject {
    toString(): string;
    productType(): string;
    setProductType(productType: string): void;
    addBuildPhase(buildPhase: PBXBuildPhase): void;
    product(): PBXObject;
    setProduct(value: string): void;
    name(): string;
    dependencies(): ReadonlyArray<PBXTargetDependency>;
    buildConfigurationList(): PBXBuildConfigList;
    defaultConfigurationName(): string;
    buildPhases(): ReadonlyArray<PBXBuildPhase>;
}
