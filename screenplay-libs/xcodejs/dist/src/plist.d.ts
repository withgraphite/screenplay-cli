import BuildSettings from "./build_settings";
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
    private static _renderWithValues;
    renderWithValues(values: BuildSettings): Plist;
    static mergeKeyFromOthers(key: string, values: any[], overrideList: string[]): any;
    static fromOthers(plists: Plist[], overrideList: string[]): Plist;
    writeFile(file: string): void;
}
export {};
