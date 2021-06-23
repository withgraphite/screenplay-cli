import { PBXNativeTarget, PBXProject } from "xcodejs";
import { InstallArgs } from "../index";
export declare function reinstall(xcodeProjectPath: string, acceptPromptsForCi: boolean, appTargetName?: string): Promise<void>;
export declare function extractScreenplayReinstallDetails(xcodeProjectPath: string, xcodeProject: PBXProject, target: PBXNativeTarget): InstallArgs;
