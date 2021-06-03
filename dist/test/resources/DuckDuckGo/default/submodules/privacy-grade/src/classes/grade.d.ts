export = Grade;
declare class Grade {
    constructor(attrs: any);
    https: boolean;
    httpsAutoUpgrade: boolean;
    privacyScore: number;
    entitiesBlocked: {};
    entitiesNotBlocked: {};
    scores: {
        site: {
            grade: any;
            score: number;
            trackerScore: number;
            httpsScore: number;
            privacyScore: number;
        };
        enhanced: {
            grade: any;
            score: number;
            trackerScore: number;
            httpsScore: number;
            privacyScore: number;
        };
    } | null;
    setHttps(https: any, httpsAutoUpgrade: any): void;
    setPrivacyScore(score: any): void;
    addEntityBlocked(name: any, prevalence: any): void;
    addEntityNotBlocked(name: any, prevalence: any): void;
    setParentEntity(name: any, prevalence: any): void;
    calculate(): void;
    get(): {
        site: {
            grade: any;
            score: number;
            trackerScore: number;
            httpsScore: number;
            privacyScore: number;
        };
        enhanced: {
            grade: any;
            score: number;
            trackerScore: number;
            httpsScore: number;
            privacyScore: number;
        };
    } | null;
    _getValueFromRangeMap(value: any, rangeMapData: any): any;
    _normalizeTrackerScore(pct: any): any;
    _scoreToGrade(score: any): any;
}
