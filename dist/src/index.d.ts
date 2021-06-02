#!/usr/bin/env node
export declare type BaseArgs = {
    "xcode-project": string;
};
export declare type AddTargetArgs = BaseArgs & {
    "app-target"?: string;
    "accept-prompts-for-ci": boolean;
};
export declare type InstallArgs = AddTargetArgs & {
    "with-tests": boolean;
    "always-enable": boolean;
} & ({
    "install-token": string;
    "app-secret": undefined;
} | {
    "install-token": undefined;
    "app-secret": string;
});
export declare type InstallVersionBundleArgs = AddTargetArgs & {
    destination: string;
    "app-version": string;
};
