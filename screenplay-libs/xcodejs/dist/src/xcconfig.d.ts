export declare class XCConfig {
    _defn: {
        [key: string]: any;
    };
    _path: string;
    constructor(defn: Record<string, unknown>, path: string);
    static fromFile(file: string): XCConfig;
    values(): {
        [key: string]: any;
    };
}
