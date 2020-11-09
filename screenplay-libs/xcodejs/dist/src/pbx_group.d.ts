import PBXObject from "./pbx_object";
export default class PBXGroup extends PBXObject {
    path(): string;
    setPath(path: string): void;
    addChild(child: PBXObject): void;
    children(): PBXObject[];
    addChildren(children: PBXObject[]): void;
}
