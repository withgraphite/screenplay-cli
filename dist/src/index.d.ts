#!/usr/bin/env node
export declare type BaseArgs = {
    "xcode-project": string;
};
export declare type AddTargetArgs = BaseArgs & {
    "app-target"?: string;
};
export declare type InstallArgs = AddTargetArgs & {
    "with-tests": boolean;
    "always-enable": boolean;
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
