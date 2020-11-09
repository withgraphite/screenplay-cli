import PBXProj from "./pbx_project";
export default class PBXObject {
    _defn: any;
    _id: string;
    _proj: PBXProj;
    constructor(id: string, proj: PBXProj, data?: Record<string, any> | null);
    get(id: string): any;
    set(key: string, value: any): void;
    remove(): void;
    updateProj(proj: PBXProj): this;
    isa(): any;
}
