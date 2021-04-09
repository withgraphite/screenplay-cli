import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function uninstall(xcodeProjectPath: string, appTargetName?: string): void;
export declare function removeScreenplayManagedTargetsAndProducts(xcodeProject: PBXProject, appTarget: PBXNativeTarget): void;
