import { PBXNativeTarget, PBXProject, PorkspacePath } from "xcodejs";
export declare function determineScheme(opts: {
    appTargetName: string;
    porkspace: PorkspacePath;
    schemeName?: string;
}): string;
export declare function error(msg: string): never;
export declare function warn(msg: string): void;
export declare function readProject(projectPath: string): PBXProject;
export declare function extractTarget(project: PBXProject, targetName: string | undefined): PBXNativeTarget;
