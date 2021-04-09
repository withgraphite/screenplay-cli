import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function error(msg: string): never;
export declare function warn(msg: string): void;
export declare function readProject(projectPath: string): PBXProject;
export declare function extractTarget(project: PBXProject, targetName: string | undefined): PBXNativeTarget;
