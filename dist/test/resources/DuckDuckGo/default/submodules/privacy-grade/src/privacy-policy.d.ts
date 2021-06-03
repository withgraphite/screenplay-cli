declare const _exports: PrivacyPolicy;
export = _exports;
declare class PrivacyPolicy {
    addLists(lists: any): void;
    tosdrList: any;
    polisisList: any;
    getScoreForUrl(url: any): any;
    getReasonsForUrl(url: any): {
        tosdr: any;
        polisis: any;
    };
    addDuplicateRulesForParents(list: any): void;
}
