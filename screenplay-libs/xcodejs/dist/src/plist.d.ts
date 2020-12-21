import BuildSettings from "./build_settings";
export declare class Plist {
    _defn: {
        [key: string]: any;
    };
    constructor(defn: {});
    static fromFile(file: string): Plist;
    get(key: string): any;
    private static _renderWithValues;
    renderWithValues(values: BuildSettings): Plist;
    static mergeKeyFromOthers(key: string, values: any[], overrideList: string[]): any;
    static fromOthers(plists: Plist[], overrideList: string[]): Plist;
    writeFile(file: string): void;
}
