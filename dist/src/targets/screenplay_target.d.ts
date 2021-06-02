#!/usr/bin/env node
import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function addScreenplayAppTarget(opts: {
    xcodeProjectPath: string;
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    workspacePath?: string;
    withExtensions?: boolean;
    withFromApp?: boolean;
    alwaysEnable?: boolean;
    acceptPrompts: boolean;
} & ({
    installToken: string;
    appSecret: undefined;
} | {
    appSecret: string;
    installToken: undefined;
})): Promise<string | null>;
