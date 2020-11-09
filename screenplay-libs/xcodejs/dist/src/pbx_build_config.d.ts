import PBXFileReference from "./pbx_file_reference";
import PBXObject from "./pbx_object";
export default class PBXBuildConfig extends PBXObject {
    buildSettings(): Record<string, any>;
    overrideBuildSettings(value: Record<string, any>): void;
    name(): string;
    isa(): string;
    baseConfigurationReference(): PBXFileReference | null;
}
