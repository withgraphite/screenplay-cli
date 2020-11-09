import PBXFileReference from "./pbx_file_reference";
import PBXObject from "./pbx_object";
import PBXProj from "./pbx_project";
declare type PBXBuildFileData = {
    isa: string;
    fileRef: string;
    settings?: {
        ATTRIBUTES: string[];
    };
};
export default class PBXBuildFile extends PBXObject {
    constructor(id: string, proj: PBXProj, data: PBXBuildFileData | null);
    static createFromFramework(fileRef: PBXFileReference, proj: PBXProj): PBXBuildFile;
    path(): string;
    setPath(path: string): void;
    addChild(child: PBXObject): void;
    children(): PBXObject[];
    fileRef(): PBXFileReference;
    addChildren(children: PBXObject[]): void;
}
export {};
