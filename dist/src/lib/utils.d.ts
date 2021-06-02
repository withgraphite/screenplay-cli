import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function readProject(projectPath: string): PBXProject;
export declare function extractTarget(project: PBXProject, targetName: string | undefined, excludeScreenplayPrefixedNames?: boolean): PBXNativeTarget;
/**
 * Given a native target, this method makes our best guess at the target's
 * product name. This inferred name may not be correct 100% of the time and
 * should be verified, if possible.
 */
export declare function inferProductName(xcodeProject: PBXProject, target: PBXNativeTarget): string | null;
export declare function getAppIcon(xcodeProject: PBXProject, target: PBXNativeTarget): string | null;
