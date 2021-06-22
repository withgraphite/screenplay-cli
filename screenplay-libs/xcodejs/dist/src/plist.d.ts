import BuildSettings from "./build_settings";
export declare class IncompatiblePlistError extends Error {
}
export declare const PlistMergeStrategies: readonly ["TakeLatestBundleValue", "TakeLatestNonNullOrUndefinedBundleValue", "TakeGreatestSemverValue"];
export declare type PlistMergeStrategy = typeof PlistMergeStrategies[number];
export interface PlistOverrides {
    [key: string]: PlistMergeStrategy;
}
declare type TPlist = string | TPlist[] | {
    [key: string]: TPlist;
};
export declare class Plist {
    _defn: {
        [key: string]: TPlist;
    };
    constructor(defn: {
        [key: string]: TPlist;
    });
    static fromFile(file: string): Plist;
    static fromString(str: string): Plist;
    get(key: string): any;
    dig(...keys: string[]): any;
    private static _renderWithValues;
    renderWithValues(values: BuildSettings): Plist;
    static mergeKeyFromOthers(key: string, values: any[], overrideList: PlistOverrides): any;
    static mergeOverrideKey(mergeStrategy: PlistMergeStrategy, values: any[]): any;
    static fromOthers(plists: Plist[], overrideList: PlistOverrides): Plist;
    writeFile(file: string): void;
}
export {};
