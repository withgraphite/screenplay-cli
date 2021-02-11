#!/usr/bin/env node
import { PBXNativeTarget, PBXProject } from "xcodejs";
export declare function addTests(opts: {
    xcodeFileName: string;
    projectPath: string;
    workspacePath?: string;
    xcodeProject: PBXProject;
    appTarget: PBXNativeTarget;
    appScheme: string;
}): void;
