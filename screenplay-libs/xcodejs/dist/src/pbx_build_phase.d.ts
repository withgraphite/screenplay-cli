import PBXBuildFile from "./pbx_build_file";
import PBXObject from "./pbx_object";
export default class PBXBuildPhase extends PBXObject {
    inputPaths(): string[];
    addFile(file: PBXBuildFile): void;
    setInputPaths(inputPaths: string[]): void;
    shellScript(): string;
    setShellScript(shellScript: string): void;
}
