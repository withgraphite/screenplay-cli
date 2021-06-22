import * as t from "retype";

export const actor = t.shape({
  firstName: t.string,
  lastName: t.string,
  profilePicture: t.nullable(t.string),
  email: t.string,
});

export const VersionToBundleStateLiterals = t.literals([
  "NO_RELEASES",
  "ONE_STABLE",
  "BUNDLING_DISABLED",
  "DEFAULT",
  "NO_STABLE",
] as const);

export type VersionToBundleState = t.TypeOf<
  typeof VersionToBundleStateLiterals
>;

export const ReleaseIndicatorLiterals = t.literals([
  "VERSION_TO_BUNDLE",
  "PARTIALLY_ROLLED_BACK",
  "FULLY_ROLLED_BACK",
] as const);

export type ReleaseIndicator = t.TypeOf<typeof ReleaseIndicatorLiterals>;

export const version = t.shape({
  id: t.string,
  name: t.string,
  absoluteUsers: t.number,
  percentUsers: t.number,
  indicators: t.array(ReleaseIndicatorLiterals),
});

export const release = t.shape({
  id: t.string,
  name: t.string,
  createdAt: t.number,
  users: t.number,
  majorVersion: t.number,
  minorVersion: t.number,
  patchVersion: t.number,
  indicators: t.array(ReleaseIndicatorLiterals),
  status: t.literals([
    "IN_APP_STORE",
    "NOT_RELEASED",
    "RELEASE_CANDIDATE",
  ] as const),
  newerVersionInAppStore: t.boolean,
  releasedDate: t.nullable(t.number),
  versions: t.array(
    t.shape({
      name: t.string,
      receivingTraffic: t.boolean,
    })
  ),
  buildReport: t.nullable(
    t.shape({
      buildRequest: t.shape({
        buildConfiguration: t.string,
        buildAction: t.string,
        author: t.nullable(actor),
      }),
    })
  ),
});

const RollbackRuleOps = t.literals(["DEVICE_MATCHES", "OS_MATCHES"] as const);

const RollbackRuleMatchConditionItem = t.shape({
  displayName: t.string,
  rollbackRuleValue: t.string,
  rollbackRuleOp: RollbackRuleOps,
});
export type TRollbackRuleMatchConditionItem = t.TypeOf<
  typeof RollbackRuleMatchConditionItem
>;

const RollbackRuleMatchConditionItems = t.shape({
  title: t.string,
  type: t.literal("MatchConditionItems" as const),
  items: t.array(RollbackRuleMatchConditionItem),
});
export type TRollbackRuleMatchConditionItems = t.TypeOf<
  typeof RollbackRuleMatchConditionItems
>;

const RollbackRuleMatchConditionItemGroup = t.shape({
  groupName: t.string,
  groupItems: t.array(RollbackRuleMatchConditionItem),
});
export type TRollbackRuleMatchConditionItemGroup = t.TypeOf<
  typeof RollbackRuleMatchConditionItemGroup
>;

const RollbackRuleMatchConditionItemGroups = t.shape({
  title: t.string,
  type: t.literal("MatchConditionItemGroups" as const),
  itemGroups: t.array(RollbackRuleMatchConditionItemGroup),
});
export type TRollbackRuleMatchConditionItemGroups = t.TypeOf<
  typeof RollbackRuleMatchConditionItemGroups
>;

const RollbackRuleMatchConditions = t.unionMany([
  RollbackRuleMatchConditionItems,
  RollbackRuleMatchConditionItemGroups,
]);

const RollbackRuleConditionSubcategory = t.shape({
  subcategoryName: t.string,
  subcategoryItems: RollbackRuleMatchConditions,
});
export type TRollbackRuleConditionSubcategory = t.TypeOf<
  typeof RollbackRuleConditionSubcategory
>;

const RollbackRuleConditionSubcategories = t.shape({
  title: t.string,
  type: t.literal("ConditionSubcategories" as const),
  subcategories: t.array(RollbackRuleConditionSubcategory),
});
export type TRollbackRuleConditionSubcategories = t.TypeOf<
  typeof RollbackRuleConditionSubcategories
>;

const RollbackRuleConditionCategory = t.shape({
  categoryName: t.string,
  categoryItems: t.unionMany([
    RollbackRuleConditionSubcategories,
    RollbackRuleMatchConditions,
  ]),
});
export type TRollbackRuleConditionCategory = t.TypeOf<
  typeof RollbackRuleConditionCategory
>;

export const RollbackRuleConditionsData = t.shape({
  type: t.literal("ConditionCategories" as const),
  categories: t.array(RollbackRuleConditionCategory),
});
export type TRollbackRuleConditionsData = t.TypeOf<
  typeof RollbackRuleConditionsData
>;
