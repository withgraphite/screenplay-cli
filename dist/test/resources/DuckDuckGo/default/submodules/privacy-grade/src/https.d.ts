declare const _exports: HTTPS;
export = _exports;
declare class HTTPS {
    addLists(lists: any): void;
    httpsList: any;
    httpsAutoUpgradeList: any;
    httpsSet: Set<any> | undefined;
    httpsAutoUpgradeSet: Set<any> | undefined;
    getUpgradedUrl(url: any): any;
    canUpgradeHost(host: any): boolean;
    hostAutoUpgrades(host: any): boolean;
}
