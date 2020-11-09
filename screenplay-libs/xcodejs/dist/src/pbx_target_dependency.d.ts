import PBXObject from "./pbx_object";
import PBXTargetProxy from "./pbx_target_proxy";
export default class PBXTargetDependency extends PBXObject {
    targetProxy(): PBXTargetProxy;
}
