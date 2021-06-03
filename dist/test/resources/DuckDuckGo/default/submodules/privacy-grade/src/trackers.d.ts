declare const _exports: Trackers;
export = _exports;
declare class Trackers {
    addLists(lists: any): void;
    entityList: {} | undefined;
    trackerList: any;
    surrogateList: {} | undefined;
    processTrackerList(data: any): any;
    processEntityList(data: any): {};
    processSurrogateList(text: any): {};
    getTrackerData(urlToCheck: any, siteUrl: any, request: any, ops: any): {
        action: string | undefined;
        reason: string | undefined;
        firstParty: boolean;
        redirectUrl: any;
        matchedRule: any;
        matchedRuleException: any;
        tracker: any;
    } | null;
    findTracker(requestData: any): any;
    findTrackerOwner(trackerDomain: any): any;
    findWebsiteOwner(requestData: any): any;
    findRule(tracker: any, requestData: any): null;
    requestMatchesRule(requestData: any, ruleObj: any): any;
    matchesRuleDefinition(rule: any, type: any, requestData: any): any;
    getAction(tracker: any): {
        action: string | undefined;
        reason: string | undefined;
    };
}
