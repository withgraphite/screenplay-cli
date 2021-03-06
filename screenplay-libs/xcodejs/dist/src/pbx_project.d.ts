import BuildSettings from "./build_settings";
import PBXBuildConfig from "./pbx_build_config";
import PBXBuildConfigList from "./pbx_build_config_list";
import PBXGroup from "./pbx_group";
import PBXNativeTarget from "./pbx_native_target";
import PBXRootObject from "./pbx_root_object";
declare type TMergedAppDetails = {
    plist: string;
    bundleId: string;
    frameworkName: string;
    frameworkExecutableName: string;
    entitlements: string;
    baseConfigurationReference: string | null;
    customBuildSettings: Record<string, any>;
};
export default class PBXProj {
    _defn: Record<string, any>;
    _srcRoot: string;
    constructor(defn: Record<string, unknown>, srcRoot: string);
    rootObject(): PBXRootObject;
    removeNode(id: string): void;
    appTargets(): PBXNativeTarget[];
    static readFileSync(file: string): PBXProj;
    writeFileSync(file: string, format?: string): void;
    duplicateTargetAndBuildSettings(target: PBXNativeTarget): PBXNativeTarget;
    stripAppTargetsExcept(name: string): void;
    private patchPath;
    private patchInfoPlist;
    private patchHeaderSearchPathsForApp;
    private patchBuildConfigValuesForTarget;
    private patchBuildPaths;
    private copyOtherObjectsIntoSelf;
    private patchMergedAppTarget;
    private patchMergedTarget;
    mergeTargets(other: PBXProj, newMainGroup: PBXGroup, filePathPrefix: string): PBXNativeTarget[];
    convertAppToFramework(target: PBXNativeTarget, filePathPrefix: string, frameworkStepId: string): TMergedAppDetails;
    extractMarketingAppIcon(buildSettings: BuildSettings, target: PBXNativeTarget): string | null;
    extractAppName(buildSettings: BuildSettings, forceExpandBuildSettings?: boolean): string | null;
    duplicateBuildConfig(buildConfig: PBXBuildConfig, project: PBXProj): PBXBuildConfig;
    duplicateBuildConfigList(buildConfigList: PBXBuildConfigList, project: PBXProj): PBXBuildConfigList;
    getTargetWithName(name: string, mustBeAppTarget?: boolean): PBXNativeTarget | null;
    addEntitlementsToBuildConfig(file: string, buildConfigId: string, baseConfigId: string | undefined, buildSettings: Record<string, any>): void;
    createGroup(name: string, path?: string): PBXGroup;
    containsNode(id: string): boolean;
    deepDuplicate(id: string, forceDuplicate?: boolean): string;
    private deepDuplicateInternal;
    allObjectKeys(): string[];
}
export {};
