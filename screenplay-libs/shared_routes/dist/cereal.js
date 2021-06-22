"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackRuleConditionsData = exports.release = exports.version = exports.ReleaseIndicatorLiterals = exports.VersionToBundleStateLiterals = exports.actor = void 0;
const t = __importStar(require("retype"));
exports.actor = t.shape({
    firstName: t.string,
    lastName: t.string,
    profilePicture: t.nullable(t.string),
    email: t.string,
});
exports.VersionToBundleStateLiterals = t.literals([
    "NO_RELEASES",
    "ONE_STABLE",
    "BUNDLING_DISABLED",
    "DEFAULT",
    "NO_STABLE",
]);
exports.ReleaseIndicatorLiterals = t.literals([
    "VERSION_TO_BUNDLE",
    "PARTIALLY_ROLLED_BACK",
    "FULLY_ROLLED_BACK",
]);
exports.version = t.shape({
    id: t.string,
    name: t.string,
    absoluteUsers: t.number,
    percentUsers: t.number,
    indicators: t.array(exports.ReleaseIndicatorLiterals),
});
exports.release = t.shape({
    id: t.string,
    name: t.string,
    createdAt: t.number,
    users: t.number,
    majorVersion: t.number,
    minorVersion: t.number,
    patchVersion: t.number,
    indicators: t.array(exports.ReleaseIndicatorLiterals),
    status: t.literals([
        "IN_APP_STORE",
        "NOT_RELEASED",
        "RELEASE_CANDIDATE",
    ]),
    newerVersionInAppStore: t.boolean,
    releasedDate: t.nullable(t.number),
    versions: t.array(t.shape({
        name: t.string,
        receivingTraffic: t.boolean,
    })),
    buildReport: t.nullable(t.shape({
        buildRequest: t.shape({
            buildConfiguration: t.string,
            buildAction: t.string,
            author: t.nullable(exports.actor),
        }),
    })),
});
const RollbackRuleOps = t.literals(["DEVICE_MATCHES", "OS_MATCHES"]);
const RollbackRuleMatchConditionItem = t.shape({
    displayName: t.string,
    rollbackRuleValue: t.string,
    rollbackRuleOp: RollbackRuleOps,
});
const RollbackRuleMatchConditionItems = t.shape({
    title: t.string,
    type: t.literal("MatchConditionItems"),
    items: t.array(RollbackRuleMatchConditionItem),
});
const RollbackRuleMatchConditionItemGroup = t.shape({
    groupName: t.string,
    groupItems: t.array(RollbackRuleMatchConditionItem),
});
const RollbackRuleMatchConditionItemGroups = t.shape({
    title: t.string,
    type: t.literal("MatchConditionItemGroups"),
    itemGroups: t.array(RollbackRuleMatchConditionItemGroup),
});
const RollbackRuleMatchConditions = t.unionMany([
    RollbackRuleMatchConditionItems,
    RollbackRuleMatchConditionItemGroups,
]);
const RollbackRuleConditionSubcategory = t.shape({
    subcategoryName: t.string,
    subcategoryItems: RollbackRuleMatchConditions,
});
const RollbackRuleConditionSubcategories = t.shape({
    title: t.string,
    type: t.literal("ConditionSubcategories"),
    subcategories: t.array(RollbackRuleConditionSubcategory),
});
const RollbackRuleConditionCategory = t.shape({
    categoryName: t.string,
    categoryItems: t.unionMany([
        RollbackRuleConditionSubcategories,
        RollbackRuleMatchConditions,
    ]),
});
exports.RollbackRuleConditionsData = t.shape({
    type: t.literal("ConditionCategories"),
    categories: t.array(RollbackRuleConditionCategory),
});
//# sourceMappingURL=cereal.js.map