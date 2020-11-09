import PBXObject from "./pbx_object";
import PBXProj from "./pbx_project";
declare type PBXFileReferenceData = {
    isa: string;
    lastKnownFileType: string;
    name: string;
    path: string;
    sourceTree: string;
};
export default class PBXFileReference extends PBXObject {
    constructor(id: string, proj: PBXProj, data?: PBXFileReferenceData | null);
    static createFromFrameworkPath(frameworkPath: string, proj: PBXProj): PBXFileReference;
    static createFromAbsolutePath(filePath: string, fileType: string, proj: PBXProj): PBXFileReference;
    path(): string;
    fullPath(): string;
}
export {};
