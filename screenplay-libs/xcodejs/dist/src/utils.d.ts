declare type BundleInfo = {
    bundleName: string;
    bundleIdentifier: string;
    bundleExecutable: string;
};
export declare function deepCopy(obj: Record<string, unknown>): any;
export declare function generateUUID(allUUIDs: string[]): string;
export declare function patchPath(initialPath: string, filePathPrefix: string): string;
export declare function getBundleInfoForFrameworkPath(frameworkPath: string): BundleInfo;
export {};
