import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function uninstall(xcodeProjectPath: string, appTargetName?: string): void;
export declare function removeScreenplayManagedTargetsAndProducts(xcodeProjectPath: string, xcodeProject: PBXProject, appTarget: PBXNativeTarget): void;
