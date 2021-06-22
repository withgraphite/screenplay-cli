import * as t from "retype";
export declare const actor: t.ShapeType<{
    firstName: t.StringType;
    lastName: t.StringType;
    profilePicture: t.UnionType<string, null>;
    email: t.StringType;
}, {
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    email: string;
}>;
export declare const VersionToBundleStateLiterals: t.PluralUnionType<t.LiteralType<"NO_RELEASES" | "ONE_STABLE" | "BUNDLING_DISABLED" | "DEFAULT" | "NO_STABLE">, "NO_RELEASES" | "ONE_STABLE" | "BUNDLING_DISABLED" | "DEFAULT" | "NO_STABLE">;
export declare type VersionToBundleState = t.TypeOf<typeof VersionToBundleStateLiterals>;
export declare const ReleaseIndicatorLiterals: t.PluralUnionType<t.LiteralType<"VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK">, "VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK">;
export declare type ReleaseIndicator = t.TypeOf<typeof ReleaseIndicatorLiterals>;
export declare const version: t.ShapeType<{
    id: t.StringType;
    name: t.StringType;
    absoluteUsers: t.NumberType;
    percentUsers: t.NumberType;
    indicators: t.ArrayType<"VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK">;
}, {
    id: string;
    name: string;
    absoluteUsers: number;
    percentUsers: number;
    indicators: ("VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK")[];
}>;
export declare const release: t.ShapeType<{
    id: t.StringType;
    name: t.StringType;
    createdAt: t.NumberType;
    users: t.NumberType;
    majorVersion: t.NumberType;
    minorVersion: t.NumberType;
    patchVersion: t.NumberType;
    indicators: t.ArrayType<"VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK">;
    status: t.PluralUnionType<t.LiteralType<"IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">, "IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">;
    newerVersionInAppStore: t.BooleanType;
    releasedDate: t.UnionType<number, null>;
    versions: t.ArrayType<{
        name: string;
        receivingTraffic: boolean;
    }>;
    buildReport: t.UnionType<{
        buildRequest: {
            buildConfiguration: string;
            buildAction: string;
            author: {
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                email: string;
            } | null;
        };
    }, null>;
}, {
    id: string;
    name: string;
    createdAt: number;
    users: number;
    majorVersion: number;
    minorVersion: number;
    patchVersion: number;
    indicators: ("VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK")[];
    status: "IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE";
    newerVersionInAppStore: boolean;
    releasedDate: number | null;
    versions: {
        name: string;
        receivingTraffic: boolean;
    }[];
    buildReport: {
        buildRequest: {
            buildConfiguration: string;
            buildAction: string;
            author: {
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                email: string;
            } | null;
        };
    } | null;
}>;
declare const RollbackRuleMatchConditionItem: t.ShapeType<{
    displayName: t.StringType;
    rollbackRuleValue: t.StringType;
    rollbackRuleOp: t.PluralUnionType<t.LiteralType<"DEVICE_MATCHES" | "OS_MATCHES">, "DEVICE_MATCHES" | "OS_MATCHES">;
}, {
    displayName: string;
    rollbackRuleValue: string;
    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
}>;
export declare type TRollbackRuleMatchConditionItem = t.TypeOf<typeof RollbackRuleMatchConditionItem>;
declare const RollbackRuleMatchConditionItems: t.ShapeType<{
    title: t.StringType;
    type: t.LiteralType<"MatchConditionItems">;
    items: t.ArrayType<{
        displayName: string;
        rollbackRuleValue: string;
        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
    }>;
}, {
    title: string;
    type: "MatchConditionItems";
    items: {
        displayName: string;
        rollbackRuleValue: string;
        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
    }[];
}>;
export declare type TRollbackRuleMatchConditionItems = t.TypeOf<typeof RollbackRuleMatchConditionItems>;
declare const RollbackRuleMatchConditionItemGroup: t.ShapeType<{
    groupName: t.StringType;
    groupItems: t.ArrayType<{
        displayName: string;
        rollbackRuleValue: string;
        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
    }>;
}, {
    groupName: string;
    groupItems: {
        displayName: string;
        rollbackRuleValue: string;
        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
    }[];
}>;
export declare type TRollbackRuleMatchConditionItemGroup = t.TypeOf<typeof RollbackRuleMatchConditionItemGroup>;
declare const RollbackRuleMatchConditionItemGroups: t.ShapeType<{
    title: t.StringType;
    type: t.LiteralType<"MatchConditionItemGroups">;
    itemGroups: t.ArrayType<{
        groupName: string;
        groupItems: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    }>;
}, {
    title: string;
    type: "MatchConditionItemGroups";
    itemGroups: {
        groupName: string;
        groupItems: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    }[];
}>;
export declare type TRollbackRuleMatchConditionItemGroups = t.TypeOf<typeof RollbackRuleMatchConditionItemGroups>;
declare const RollbackRuleConditionSubcategory: t.ShapeType<{
    subcategoryName: t.StringType;
    subcategoryItems: t.PluralUnionType<t.ShapeType<{
        title: t.StringType;
        type: t.LiteralType<"MatchConditionItems">;
        items: t.ArrayType<{
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }>;
    }, {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    }> | t.ShapeType<{
        title: t.StringType;
        type: t.LiteralType<"MatchConditionItemGroups">;
        itemGroups: t.ArrayType<{
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }>;
    }, {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    }>, {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    } | {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    }>;
}, {
    subcategoryName: string;
    subcategoryItems: {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    } | {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    };
}>;
export declare type TRollbackRuleConditionSubcategory = t.TypeOf<typeof RollbackRuleConditionSubcategory>;
declare const RollbackRuleConditionSubcategories: t.ShapeType<{
    title: t.StringType;
    type: t.LiteralType<"ConditionSubcategories">;
    subcategories: t.ArrayType<{
        subcategoryName: string;
        subcategoryItems: {
            title: string;
            type: "MatchConditionItems";
            items: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        } | {
            title: string;
            type: "MatchConditionItemGroups";
            itemGroups: {
                groupName: string;
                groupItems: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            }[];
        };
    }>;
}, {
    title: string;
    type: "ConditionSubcategories";
    subcategories: {
        subcategoryName: string;
        subcategoryItems: {
            title: string;
            type: "MatchConditionItems";
            items: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        } | {
            title: string;
            type: "MatchConditionItemGroups";
            itemGroups: {
                groupName: string;
                groupItems: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            }[];
        };
    }[];
}>;
export declare type TRollbackRuleConditionSubcategories = t.TypeOf<typeof RollbackRuleConditionSubcategories>;
declare const RollbackRuleConditionCategory: t.ShapeType<{
    categoryName: t.StringType;
    categoryItems: t.PluralUnionType<t.PluralUnionType<t.ShapeType<{
        title: t.StringType;
        type: t.LiteralType<"MatchConditionItems">;
        items: t.ArrayType<{
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }>;
    }, {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    }> | t.ShapeType<{
        title: t.StringType;
        type: t.LiteralType<"MatchConditionItemGroups">;
        itemGroups: t.ArrayType<{
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }>;
    }, {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    }>, {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    } | {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    }> | t.ShapeType<{
        title: t.StringType;
        type: t.LiteralType<"ConditionSubcategories">;
        subcategories: t.ArrayType<{
            subcategoryName: string;
            subcategoryItems: {
                title: string;
                type: "MatchConditionItems";
                items: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            } | {
                title: string;
                type: "MatchConditionItemGroups";
                itemGroups: {
                    groupName: string;
                    groupItems: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                }[];
            };
        }>;
    }, {
        title: string;
        type: "ConditionSubcategories";
        subcategories: {
            subcategoryName: string;
            subcategoryItems: {
                title: string;
                type: "MatchConditionItems";
                items: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            } | {
                title: string;
                type: "MatchConditionItemGroups";
                itemGroups: {
                    groupName: string;
                    groupItems: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                }[];
            };
        }[];
    }>, {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    } | {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    } | {
        title: string;
        type: "ConditionSubcategories";
        subcategories: {
            subcategoryName: string;
            subcategoryItems: {
                title: string;
                type: "MatchConditionItems";
                items: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            } | {
                title: string;
                type: "MatchConditionItemGroups";
                itemGroups: {
                    groupName: string;
                    groupItems: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                }[];
            };
        }[];
    }>;
}, {
    categoryName: string;
    categoryItems: {
        title: string;
        type: "MatchConditionItems";
        items: {
            displayName: string;
            rollbackRuleValue: string;
            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
        }[];
    } | {
        title: string;
        type: "MatchConditionItemGroups";
        itemGroups: {
            groupName: string;
            groupItems: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        }[];
    } | {
        title: string;
        type: "ConditionSubcategories";
        subcategories: {
            subcategoryName: string;
            subcategoryItems: {
                title: string;
                type: "MatchConditionItems";
                items: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            } | {
                title: string;
                type: "MatchConditionItemGroups";
                itemGroups: {
                    groupName: string;
                    groupItems: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                }[];
            };
        }[];
    };
}>;
export declare type TRollbackRuleConditionCategory = t.TypeOf<typeof RollbackRuleConditionCategory>;
export declare const RollbackRuleConditionsData: t.ShapeType<{
    type: t.LiteralType<"ConditionCategories">;
    categories: t.ArrayType<{
        categoryName: string;
        categoryItems: {
            title: string;
            type: "MatchConditionItems";
            items: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        } | {
            title: string;
            type: "MatchConditionItemGroups";
            itemGroups: {
                groupName: string;
                groupItems: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            }[];
        } | {
            title: string;
            type: "ConditionSubcategories";
            subcategories: {
                subcategoryName: string;
                subcategoryItems: {
                    title: string;
                    type: "MatchConditionItems";
                    items: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                } | {
                    title: string;
                    type: "MatchConditionItemGroups";
                    itemGroups: {
                        groupName: string;
                        groupItems: {
                            displayName: string;
                            rollbackRuleValue: string;
                            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                        }[];
                    }[];
                };
            }[];
        };
    }>;
}, {
    type: "ConditionCategories";
    categories: {
        categoryName: string;
        categoryItems: {
            title: string;
            type: "MatchConditionItems";
            items: {
                displayName: string;
                rollbackRuleValue: string;
                rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
            }[];
        } | {
            title: string;
            type: "MatchConditionItemGroups";
            itemGroups: {
                groupName: string;
                groupItems: {
                    displayName: string;
                    rollbackRuleValue: string;
                    rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                }[];
            }[];
        } | {
            title: string;
            type: "ConditionSubcategories";
            subcategories: {
                subcategoryName: string;
                subcategoryItems: {
                    title: string;
                    type: "MatchConditionItems";
                    items: {
                        displayName: string;
                        rollbackRuleValue: string;
                        rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                    }[];
                } | {
                    title: string;
                    type: "MatchConditionItemGroups";
                    itemGroups: {
                        groupName: string;
                        groupItems: {
                            displayName: string;
                            rollbackRuleValue: string;
                            rollbackRuleOp: "DEVICE_MATCHES" | "OS_MATCHES";
                        }[];
                    }[];
                };
            }[];
        };
    }[];
}>;
export declare type TRollbackRuleConditionsData = t.TypeOf<typeof RollbackRuleConditionsData>;
export {};
