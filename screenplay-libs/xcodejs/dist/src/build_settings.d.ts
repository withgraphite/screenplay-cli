export default class BuildSettings {
    _defn: Record<string, any>;
    constructor(defn: {});
    static loadFromFile(filePath: string): BuildSettings;
    static loadFromProject(project: string, target: string, options: {}): BuildSettings;
    writeToFile(filePath: string): void;
    get(key: string): any;
    private applyOperation;
    expand(value: string): string;
    buildProductsDir(baseDir: string): string;
    getFrameworkPath(buildPath: string): string;
}
export declare function getBuildSettingsAndTargetNameFromTarget(project: string, target: string, options: {}): readonly [BuildSettings, string];
