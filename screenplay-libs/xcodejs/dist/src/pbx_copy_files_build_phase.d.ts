import PBXBuildFile from "./pbx_build_file";
import PBXBuildPhase from "./pbx_build_phase";
import PBXProj from "./pbx_project";
declare type PBXCopyFilesBuildPhaseData = {
    isa: string;
    buildActionMask: string;
    dstPath: string;
    dstSubfolderSpec: number;
    files: string[];
    name: string;
    runOnlyForDeploymentPostprocessing: number;
};
export default class PBXCopyFilesBuildPhase extends PBXBuildPhase {
    constructor(id: string, proj: PBXProj, data?: PBXCopyFilesBuildPhaseData | null);
    static createForBuildFiles(buildFiles: PBXBuildFile[], proj: PBXProj): PBXCopyFilesBuildPhase;
    inputPaths(): string[];
    setInputPaths(inputPaths: string[]): void;
    shellScript(): string;
    setShellScript(shellScript: string): void;
}
export {};
