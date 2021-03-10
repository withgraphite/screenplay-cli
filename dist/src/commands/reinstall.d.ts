import { PBXProject } from "xcodejs";
import { InstallArgs } from "../index";
export declare function reinstall(xcodeProjectPath: string): Promise<void>;
export declare function extractScreenplayReinstallDetails(xcodeProjectPath: string, xcodeProject: PBXProject): InstallArgs[];
