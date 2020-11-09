export declare class XCConfig {
    _defn: {
        [key: string]: any;
    };
    _path: string;
    constructor(defn: {}, path: string);
    static fromFile(file: string): XCConfig;
    values(): {
        [key: string]: any;
    };
}
