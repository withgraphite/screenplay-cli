import convert from "xml-js";
export declare class XCWorkspace {
    _defn: convert.ElementCompact;
    _path: string;
    constructor(defn: Record<string, any>, path: string);
    allFiles(): string[];
    updateLocation(oldLocation: string, newLocation: string): void;
    static fromFile(filePath: string): XCWorkspace;
    save(): void;
}
