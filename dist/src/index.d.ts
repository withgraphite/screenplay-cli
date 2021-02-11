#!/usr/bin/env node
export declare type BaseArgs = {
    "xcode-project": string;
};
export declare type AddTargetArgs = BaseArgs & {
    "app-target"?: string;
    "app-scheme"?: string;
    workspace?: string;
};
export declare type InstallArgs = AddTargetArgs & {
    "app-config-name"?: string;
    "with-tests": boolean;
} & ({
    key: string;
    appToken: undefined;
} | {
    key: undefined;
    appToken: string;
});
export declare type InstallVersionBundleArgs = AddTargetArgs & {
    destination: string;
    "app-version": string;
};
