import PBXNativeTarget from "./pbx_native_target";
export declare function schemeExists(projectPath: string, schemeName: string): boolean;
export declare function createSchema(opts: {
    projectPath: string;
    srcSchemeName: string;
    srcAppTarget: PBXNativeTarget;
    newBuildTarget: PBXNativeTarget;
    buildableNameExtension: "app" | "framework";
}): string;
export declare function addTests(opts: {
    projectPath: string;
    appScheme: string;
    nativeTargetID: string;
    xcodeFileName: string;
}): void;
