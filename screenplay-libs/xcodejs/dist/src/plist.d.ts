export declare class Plist {
    _defn: {
        [key: string]: any;
    };
    constructor(defn: {});
    static fromFile(file: string): Plist;
    get(key: string): any;
    static mergeKeyFromOthers(key: string, values: any[]): any;
    static fromOthers(plists: Plist[]): Plist;
    writeFile(file: string): void;
}
