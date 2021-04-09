import PBXNativeTarget from "./pbx_native_target";
import PBXProj from "./pbx_project";
import { PorkspacePath } from "./porkspace_type";
export declare function list(porkspacePath: PorkspacePath): string[];
export declare function findSrcSchemePath(opts: {
    projectPath: string;
    workspacePath?: string;
    schemeName: string;
}): string | undefined;
export declare function createSchema(opts: {
    projectPath: string;
    workspacePath?: string;
    srcSchemeName: string;
    srcAppTarget: PBXNativeTarget;
    newBuildTarget: PBXNativeTarget;
    buildableNameExtension: "app" | "framework";
}): string;
export declare function removeAllTests(opts: {
    projectPath: string;
    workspacePath?: string;
    appScheme: string;
    project: PBXProj;
}): void;
export declare function addTests(opts: {
    projectPath: string;
    workspacePath?: string;
    appScheme: string;
    nativeTargetID: string;
    testTargetName: string;
    xcodeFileName: string;
}): void;
