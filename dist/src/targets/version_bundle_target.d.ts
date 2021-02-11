import { PBXNativeTarget, PBXProject, PorkspacePath } from "xcodejs";
export declare function addVersionBundleTarget(opts: {
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    destination: string;
    appScheme: string;
    porkspace: PorkspacePath;
}): PBXNativeTarget;
