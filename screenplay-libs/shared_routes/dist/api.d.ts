import * as t from "retype";
declare const API_ROUTES: {
    readonly featureFlags: {
        readonly method: "GET";
        readonly url: "/feature-flags";
        readonly response: {
            killswitch: t.BooleanType;
            killswitchReason: t.StringType;
            rotoscopeKillswitch: t.BooleanType;
            useRollbackFlowRedesign: t.BooleanType;
        };
    };
    readonly health: {
        readonly method: "GET";
        readonly url: "/health";
    };
    readonly requestDemo: {
        readonly method: "POST";
        readonly url: "/request-demo";
        readonly params: {
            readonly email: t.StringType;
        };
    };
    readonly scripts: {
        readonly buildPhaseDownloaderOld: {
            readonly method: "GET";
            readonly url: "/app-secret/:appSecret/build-phase-downloader";
            readonly urlParams: {
                readonly appSecret: t.StringType;
            };
        };
        readonly buildPhaseDownloader: {
            readonly method: "GET";
            readonly url: "/build-phase-downloader";
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
        };
    };
    readonly buildAuthor: {
        readonly bind: {
            readonly method: "POST";
            readonly url: "/build-author/link";
            readonly queryParams: {};
            readonly params: {
                readonly authorId: t.StringType;
                readonly releaseId: t.StringType;
            };
        };
    };
    readonly versionBundles: {
        readonly upload: {
            readonly method: "POST";
            readonly url: "/app/versions";
            readonly queryParams: {};
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
            readonly params: {
                readonly semver: t.StringType;
                readonly name: t.StringType;
                readonly archs: t.ArrayType<string>;
                readonly isRelease: t.BooleanType;
                readonly buildPhaseVersion: t.StringType;
                readonly kind: t.PluralUnionType<t.LiteralType<"source" | "app">, "source" | "app">;
            };
            readonly response: {
                readonly id: t.StringType;
                readonly presignedUrl: t.UnionType<string, null>;
            };
        };
        readonly markUploadComplete: {
            readonly method: "POST";
            readonly url: "/app/version/:versionId/upload-complete";
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
            readonly urlParams: {
                readonly versionId: t.StringType;
            };
        };
    };
    readonly demo: {
        readonly toggleRelease: {
            readonly method: "POST";
            readonly url: "/demo/toggle-release";
            readonly params: {
                readonly version: t.NumberType;
            };
        };
    };
    readonly auth: {
        readonly logout: {
            readonly method: "DELETE";
            readonly url: "/auth";
        };
    };
    readonly apps: {
        readonly generateCLI: {
            readonly method: "GET";
            readonly url: "/org/:orgId/create-app-cli";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly response: {
                readonly org: t.ShapeType<{
                    name: t.StringType;
                }, {
                    name: string;
                }>;
                readonly newAppToken: t.StringType;
            };
        };
        readonly getSecret: {
            readonly method: "GET";
            readonly url: "/app/secret";
            readonly urlParams: {};
            readonly queryParams: {
                readonly newAppToken: t.StringType;
                readonly bundleIdentifier: t.StringType;
            };
            readonly response: {
                readonly appSecret: t.UnionType<string, undefined>;
            };
        };
        readonly create: {
            readonly method: "POST";
            readonly url: "/new-app/:newAppToken";
            readonly urlParams: {
                readonly newAppToken: t.StringType;
            };
            readonly params: {
                readonly bundleIdentifier: t.UnionType<string, undefined>;
                readonly name: t.StringType;
            };
            readonly response: {
                readonly id: t.StringType;
                readonly appSecret: t.StringType;
            };
        };
        readonly updateAppIcon: {
            readonly method: "PUT";
            readonly url: "/app/icon";
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
            readonly rawBody: true;
        };
        readonly createBuild: {
            readonly method: "POST";
            readonly url: "/app/builds";
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
            readonly params: {
                readonly versions: t.ArrayType<string>;
                readonly includeDefaultVersions: t.BooleanType;
                readonly maxSemverForDefaultVersions: t.StringType;
                readonly archs: t.ArrayType<string>;
                readonly withFallbackVersion: t.UnionType<string, undefined>;
                readonly plistOverrides: t.UnionType<string[], undefined>;
                readonly buildAuthor: t.UnionType<string, undefined>;
                readonly buildAction: t.UnionType<string, undefined>;
                readonly buildConfiguration: t.UnionType<string, undefined>;
                readonly clobberPaths: t.UnionType<string[], undefined>;
            };
            readonly response: {
                readonly id: t.StringType;
            };
        };
    };
    readonly build: {
        readonly status: {
            readonly method: "GET";
            readonly url: "/build/:buildId/status";
            readonly urlParams: {
                readonly buildId: t.StringType;
            };
            readonly headers: {
                readonly "X-SP-APP-SECRET": t.StringType;
            };
            readonly response: {
                readonly status: t.PluralUnionType<t.LiteralType<"BOOTING" | "WORKING" | "SUCCESS" | "FAILURE">, "BOOTING" | "WORKING" | "SUCCESS" | "FAILURE">;
                readonly downloadURL: t.UnionType<string, undefined>;
                readonly appId: t.UnionType<string, undefined>;
                readonly releaseId: t.UnionType<string, undefined>;
            };
        };
    };
    readonly app: {
        readonly release: {
            readonly method: "GET";
            readonly url: "/app/:appId/release/:releaseId";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
            };
            readonly response: {
                readonly app: t.ShapeType<{
                    name: t.StringType;
                    icon: t.UnionType<string, null>;
                    store: t.PluralUnionType<t.LiteralType<"IOS">, "IOS">;
                    totalUsers: t.UnionType<number, null>;
                }, {
                    name: string;
                    icon: string | null;
                    store: "IOS";
                    totalUsers: number | null;
                }>;
                readonly name: t.StringType;
                readonly created: t.NumberType;
                readonly userCount: t.UnionType<number, null>;
                readonly size: t.UnionType<number, null>;
                readonly indicators: t.ArrayType<"VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK">;
                readonly status: t.PluralUnionType<t.LiteralType<"IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">, "IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">;
                readonly newerVersionInAppStore: t.BooleanType;
                readonly releasedDate: t.UnionType<number, null>;
                readonly buildReport: t.UnionType<{
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
                    didFallback: boolean;
                    fallbackReason: string | undefined;
                }, null>;
                readonly timeline: t.ArrayType<{
                    actor: {
                        firstName: string;
                        lastName: string;
                        profilePicture: string | null;
                        email: string;
                    } | null;
                    date: number;
                    event: {
                        kind: "CREATED" | "RULES_CHANGED";
                    };
                    note: string | null;
                    beforeRuleSetId: string;
                    afterRuleSetId: string;
                }>;
                readonly versions: t.ArrayType<{
                    id: string;
                    name: string;
                    color: string;
                    size: number | null;
                    fileSizeTreeURL: string | null;
                    receivingTraffic: boolean;
                    default: boolean;
                }>;
            };
        };
        readonly releaseAppOpens: {
            readonly method: "GET";
            readonly url: "/app/:appId/release/:releaseId/app-opens";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
            };
            readonly response: {
                readonly datapoints: t.ArrayType<{
                    time: number;
                    versions: {
                        id: string;
                        appOpens: number;
                    }[];
                }>;
            };
        };
        readonly releaseRollbacks: {
            readonly method: "GET";
            readonly url: "/app/:appId/release/:releaseId/rollbacks";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
            };
            readonly queryParams: {
                readonly rollbackRuleSetId: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly rollbackRules: t.ArrayType<{
                    targetVersionId: string;
                    conditions: ({
                        op: "DEVICE_MATCHES";
                        matches: string;
                    } | {
                        op: "OS_MATCHES";
                        matches: string;
                    })[];
                }>;
                readonly everyoneElseVersionId: t.StringType;
            };
        };
        readonly saveReleaseRollbacks: {
            readonly method: "PUT";
            readonly url: "/app/:appId/release/:releaseId/rollbacks";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
            };
            readonly params: {
                readonly rollbackRules: t.ArrayType<{
                    targetVersionId: string;
                    conditions: ({
                        op: "DEVICE_MATCHES";
                        matches: string;
                    } | {
                        op: "OS_MATCHES";
                        matches: string;
                    })[];
                }>;
                readonly everyoneElseVersionId: t.StringType;
            };
        };
        readonly releaseRollbackConditions: {
            readonly method: "GET";
            readonly url: "/app/:appId/rollback-conditons";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly response: {
                readonly conditions: t.ShapeType<{
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
            };
        };
        readonly releaseRollbacksConditionTypeahead: {
            readonly method: "GET";
            readonly url: "/app/:appId/release/:releaseId/rollbacks/conditions";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
            };
            readonly queryParams: {
                readonly q: t.StringType;
            };
            readonly response: {
                readonly conditions: t.ArrayType<{
                    op: "DEVICE_MATCHES";
                    matches: string;
                } | {
                    op: "OS_MATCHES";
                    matches: string;
                }>;
            };
        };
        readonly releasesHeader: {
            readonly method: "GET";
            readonly url: "/app/:appId/releases-header";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly response: {
                readonly name: t.StringType;
                readonly icon: t.UnionType<string, null>;
                readonly store: t.LiteralType<"IOS">;
                readonly totalUsers: t.NumberType;
                readonly totalReleases: t.NumberType;
                readonly totalBuilds: t.NumberType;
                readonly versionsToBundle: t.ShapeType<{
                    versionNames: t.ArrayType<string>;
                    state: t.PluralUnionType<t.LiteralType<"NO_RELEASES" | "ONE_STABLE" | "BUNDLING_DISABLED" | "DEFAULT" | "NO_STABLE">, "NO_RELEASES" | "ONE_STABLE" | "BUNDLING_DISABLED" | "DEFAULT" | "NO_STABLE">;
                }, {
                    versionNames: string[];
                    state: "NO_RELEASES" | "ONE_STABLE" | "BUNDLING_DISABLED" | "DEFAULT" | "NO_STABLE";
                }>;
                readonly mostRecentReleases: t.ArrayType<{
                    id: string;
                    name: string;
                    users: number;
                }>;
            };
        };
        readonly buildsAfterLatestRelease: {
            readonly method: "GET";
            readonly url: "/app/:appId/new-releases";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly queryParams: {
                readonly beforeDate: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly releases: t.ArrayType<{
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
            };
        };
        readonly buildsBeforeLatestRelease: {
            readonly method: "GET";
            readonly url: "/app/:appId/previous-releases";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly queryParams: {
                readonly beforeDate: t.UnionType<string, undefined>;
                readonly beforeMajorVersion: t.UnionType<string, undefined>;
                readonly beforeMinorVersion: t.UnionType<string, undefined>;
                readonly beforePatchVersion: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly releases: t.ArrayType<{
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
            };
        };
        readonly setVersionsToBundle: {
            readonly method: "PUT";
            readonly url: "/app/:appId/versionToBundle";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly params: {
                readonly versionBundleIds: t.ArrayType<string>;
            };
        };
        readonly versionsReleased: {
            readonly method: "GET";
            readonly url: "/app/:appId/versions-released";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly queryParams: {};
            readonly response: {
                readonly versions: t.ArrayType<{
                    id: string;
                    name: string;
                    absoluteUsers: number;
                    percentUsers: number;
                    indicators: ("VERSION_TO_BUNDLE" | "PARTIALLY_ROLLED_BACK" | "FULLY_ROLLED_BACK")[];
                }>;
            };
        };
        readonly releasesInAppStore: {
            readonly method: "GET";
            readonly url: "/app/:appId/app-store-releases";
            readonly urlParams: {
                readonly appId: t.StringType;
            };
            readonly queryParams: {
                readonly beforeMajorVersion: t.UnionType<string, undefined>;
                readonly beforeMinorVersion: t.UnionType<string, undefined>;
                readonly beforePatchVersion: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly releases: t.ArrayType<{
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
            };
        };
        readonly releasesForSemver: {
            readonly method: "GET";
            readonly url: "/app/:appId/semver/:semver";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly semver: t.StringType;
            };
            readonly response: {
                readonly releases: t.ArrayType<{
                    id: string;
                    name: string;
                    createdAt: number;
                    users: number;
                    released: boolean;
                }>;
                readonly releaseDate: t.UnionType<number, null>;
            };
        };
        readonly updateReleaseForSemver: {
            readonly method: "PUT";
            readonly url: "/app/:appId/semver/:semver";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly semver: t.StringType;
            };
            readonly params: {
                readonly id: t.UnionType<string, null>;
                readonly releaseDate: t.UnionType<number, null>;
            };
        };
    };
    readonly bootstrap: {
        readonly method: "GET";
        readonly url: "/bootstrap";
        readonly response: {
            readonly user: t.UnionType<{
                id: string;
                onboardingComplete: boolean;
                firstName: string;
                lastName: string;
                employee: boolean;
                profilePicture: string | undefined;
                email: string;
                mostRecentAppId: string | undefined;
                apps: {
                    id: string;
                    name: string;
                    icon: string | undefined;
                    store: "IOS";
                    org: {
                        name: string;
                    };
                }[];
            }, undefined>;
            readonly ff: t.ShapeType<{
                killswitch: t.BooleanType;
                killswitchReason: t.StringType;
                rotoscopeKillswitch: t.BooleanType;
                useRollbackFlowRedesign: t.BooleanType;
            }, {
                killswitch: boolean;
                killswitchReason: string;
                rotoscopeKillswitch: boolean;
                useRollbackFlowRedesign: boolean;
            }>;
        };
    };
    readonly docs: {
        readonly page: {
            readonly method: "GET";
            readonly url: "/docs/page";
            readonly queryParams: {
                readonly slug: t.StringType;
            };
            readonly response: {
                readonly id: t.StringType;
                readonly title: t.StringType;
                readonly text: t.StringType;
                readonly published: t.BooleanType;
            };
        };
        readonly pages: {
            readonly method: "GET";
            readonly url: "/docs/pages";
            readonly response: {
                readonly pages: t.ArrayType<{
                    id: string;
                    title: string;
                    published: boolean;
                    slug: string;
                }>;
            };
        };
        readonly navbar: {
            readonly method: "GET";
            readonly url: "/docs/navbar";
            readonly response: {
                readonly entries: t.ArrayType<{
                    page: {
                        slug: string;
                        pageId: string;
                    } | null;
                    title: string;
                    realTitle: string | null;
                    depth: number;
                }>;
            };
        };
        readonly createPage: {
            readonly method: "POST";
            readonly url: "/docs/pages";
            readonly response: {
                readonly slug: t.StringType;
            };
        };
        readonly editPage: {
            readonly method: "PUT";
            readonly url: "/docs/page-id/:id";
            readonly urlParams: {
                readonly id: t.StringType;
            };
            readonly params: {
                readonly slug: t.StringType;
                readonly title: t.StringType;
                readonly text: t.StringType;
                readonly published: t.BooleanType;
            };
        };
        readonly deletePage: {
            readonly method: "DELETE";
            readonly url: "/docs/page-id/:id";
            readonly urlParams: {
                readonly id: t.StringType;
            };
        };
        readonly editNavbar: {
            readonly method: "PUT";
            readonly url: "/docs/navbar";
            readonly params: {
                readonly entries: t.ArrayType<{
                    pageId: string | null;
                    title: string | null;
                    depth: number;
                }>;
            };
        };
    };
    readonly blogs: {
        readonly latestPost: {
            readonly method: "GET";
            readonly url: "/blog/lastest-post";
            readonly response: {
                readonly id: t.StringType;
            };
        };
        readonly page: {
            readonly method: "GET";
            readonly url: "/blog/post/:id";
            readonly urlParams: {
                readonly id: t.StringType;
            };
            readonly response: {
                readonly title: t.StringType;
                readonly text: t.StringType;
                readonly published: t.BooleanType;
                readonly createdAt: t.NumberType;
                readonly wordCount: t.NumberType;
                readonly coverPhoto: t.UnionType<string, null>;
                readonly publishedAt: t.UnionType<number, null>;
                readonly author: t.UnionType<{
                    firstName: string;
                    lastName: string;
                    profilePicture: string | null;
                    email: string | null;
                    twitterHandle: string | null;
                }, null>;
                readonly nextPost: t.UnionType<{
                    name: string;
                    id: string;
                }, null>;
                readonly previousPost: t.UnionType<{
                    name: string;
                    id: string;
                }, null>;
            };
        };
        readonly listAttachments: {
            readonly method: "GET";
            readonly url: "/blog/post/:id/attachments";
            readonly urlParams: {
                readonly id: t.StringType;
            };
            readonly response: {
                readonly attachments: t.ArrayType<{
                    id: string;
                    kind: "IMAGE";
                    url: string;
                }>;
            };
        };
        readonly createImageAttachment: {
            readonly method: "POST";
            readonly url: "/blog/post/:id/image-attachments";
            readonly urlParams: {
                readonly id: t.StringType;
            };
            readonly rawBody: true;
            readonly response: {
                readonly id: t.StringType;
                readonly url: t.StringType;
            };
        };
        readonly deleteAttachment: {
            readonly method: "DELETE";
            readonly url: "/blog/post/:id/attachment/:attachmentId";
            readonly urlParams: {
                readonly id: t.StringType;
                readonly attachmentId: t.StringType;
            };
        };
        readonly pages: {
            readonly method: "GET";
            readonly url: "/blog/posts";
            readonly response: {
                readonly pages: t.ArrayType<{
                    id: string;
                    title: string;
                    published: boolean;
                    createdAt: number;
                    wordCount: number;
                }>;
            };
        };
        readonly createPage: {
            readonly method: "POST";
            readonly url: "/blog/posts";
            readonly response: {
                readonly id: t.StringType;
            };
        };
        readonly editPage: {
            readonly method: "PUT";
            readonly url: "/blog/post/:id";
            readonly urlParams: {
                readonly id: t.StringType;
            };
            readonly params: {
                readonly title: t.StringType;
                readonly text: t.StringType;
                readonly published: t.BooleanType;
                readonly coverPhoto: t.UnionType<string, null>;
                readonly publishedAt: t.UnionType<number, null>;
                readonly authorEmail: t.UnionType<string, null>;
            };
        };
        readonly deletePage: {
            readonly method: "DELETE";
            readonly url: "/blog/post/:id";
            readonly urlParams: {
                readonly id: t.StringType;
            };
        };
    };
    readonly onboarding: {
        readonly method: "GET";
        readonly url: "/onboarding";
        readonly response: {
            readonly state: t.UnionType<"ACCOUNT", "ORG" | "ALLSET" | "DONE">;
            readonly user: t.ShapeType<{
                firstName: t.StringType;
                lastName: t.StringType;
                profilePicture: t.UnionType<string, undefined>;
                email: t.StringType;
                domain: t.UnionType<string, null>;
            }, {
                firstName: string;
                lastName: string;
                profilePicture: string | undefined;
                email: string;
                domain: string | null;
            }>;
            readonly teams: t.ArrayType<{
                id: string;
                name: string;
                domain: string | null;
                admin: boolean;
                apps: {
                    id: string;
                    name: string;
                    icon: string | undefined;
                }[];
                plan: "BETA" | undefined;
            }>;
        };
    };
    readonly intercut: {
        readonly oldFlags: {
            readonly method: "POST";
            readonly url: "/intercut/:releaseSecret/flags";
            readonly urlParams: {
                readonly releaseSecret: t.StringType;
            };
            readonly params: {
                readonly persistId: t.StringType;
                readonly os: t.StringType;
                readonly device: t.StringType;
                readonly bootedVersion: t.UnionType<number, undefined>;
            };
            readonly response: {
                readonly version: t.NumberType;
                readonly backgroundTerminationEnabled: t.BooleanType;
            };
        };
        readonly flags: {
            readonly method: "POST";
            readonly url: "/intercut/flags";
            readonly headers: {
                readonly "X-SP-RELEASE-SECRET": t.StringType;
            };
            readonly params: {
                readonly persistId: t.StringType;
                readonly os: t.StringType;
                readonly device: t.StringType;
                readonly bootedVersion: t.UnionType<number, undefined>;
            };
            readonly response: {
                readonly version: t.NumberType;
            };
        };
    };
    readonly user: {
        readonly updateProfilePicture: {
            readonly method: "PUT";
            readonly url: "/user/profile-picture";
            readonly rawBody: true;
        };
        readonly orgs: {
            readonly method: "GET";
            readonly url: "/user/orgs";
            readonly response: {
                readonly orgs: t.ArrayType<{
                    id: string;
                    name: string;
                    admin: boolean;
                    apps: {
                        id: string;
                        name: string;
                        icon: string | undefined;
                    }[];
                }>;
            };
        };
        readonly settings: {
            readonly method: "GET";
            readonly url: "/user/settings";
            readonly response: {
                readonly id: t.StringType;
                readonly firstName: t.StringType;
                readonly lastName: t.StringType;
                readonly profilePicture: t.UnionType<string, undefined>;
                readonly email: t.StringType;
                readonly domain: t.UnionType<string, null>;
                readonly twitterHandle: t.UnionType<string, null>;
                readonly orgs: t.ArrayType<{
                    id: string;
                    name: string;
                    admin: boolean;
                    apps: {
                        id: string;
                        name: string;
                        icon: string | undefined;
                    }[];
                }>;
            };
        };
        readonly updateName: {
            readonly method: "PATCH";
            readonly url: "/user/me/name";
            readonly params: {
                readonly firstName: t.StringType;
                readonly lastName: t.StringType;
            };
        };
        readonly updateTwitterHandle: {
            readonly method: "PATCH";
            readonly url: "/user/me/twitter";
            readonly params: {
                readonly handle: t.StringType;
            };
        };
        readonly completeSetup: {
            readonly method: "POST";
            readonly url: "/user/me/setup";
        };
        readonly acknowledgeOrgs: {
            readonly method: "POST";
            readonly url: "/user/me/acknowledge-orgs";
        };
        readonly createOrg: {
            readonly method: "POST";
            readonly url: "/orgs";
            readonly params: {
                readonly name: t.StringType;
                readonly withDomain: t.BooleanType;
            };
            readonly response: {
                readonly orgId: t.StringType;
            };
        };
        readonly completeOnboarding: {
            readonly method: "POST";
            readonly url: "/user/me/complete-onboarding";
        };
    };
    readonly org: {
        readonly settings: {
            readonly method: "GET";
            readonly url: "/org/:orgId/settings";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly response: {
                readonly id: t.StringType;
                readonly name: t.StringType;
                readonly admin: t.BooleanType;
                readonly domain: t.UnionType<string, null>;
            };
        };
        readonly members: {
            readonly method: "GET";
            readonly url: "/org/:orgId/members";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly response: {
                readonly members: t.ArrayType<{
                    id: string;
                    firstName: string;
                    lastName: string;
                    admin: boolean;
                    profilePicture: string | undefined;
                    email: string;
                }>;
                readonly invites: t.ArrayType<{
                    id: string;
                    email: string;
                }>;
            };
        };
        readonly promoteAdmin: {
            readonly method: "POST";
            readonly url: "/org/:orgId/admins";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly params: {
                readonly userId: t.StringType;
            };
        };
        readonly demoteAdmin: {
            readonly method: "DELETE";
            readonly url: "/org/:orgId/admin/:userId";
            readonly urlParams: {
                readonly orgId: t.StringType;
                readonly userId: t.StringType;
            };
            readonly response: {
                readonly success: t.BooleanType;
            };
        };
        readonly leave: {
            readonly method: "DELETE";
            readonly url: "/org/:orgId/membership";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly response: {
                readonly success: t.BooleanType;
            };
        };
        readonly removeMember: {
            readonly method: "DELETE";
            readonly url: "/org/:orgId/member/:userId";
            readonly urlParams: {
                readonly orgId: t.StringType;
                readonly userId: t.StringType;
            };
        };
        readonly anyoneWithDomainCanJoin: {
            readonly method: "POST";
            readonly url: "/org/:orgId/domain";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
        };
        readonly anyoneWithDomainCanNotJoin: {
            readonly method: "DELETE";
            readonly url: "/org/:orgId/domain";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
        };
        readonly revokeInvite: {
            readonly method: "DELETE";
            readonly url: "/org/:orgId/invite/:inviteId";
            readonly urlParams: {
                readonly orgId: t.StringType;
                readonly inviteId: t.StringType;
            };
        };
        readonly setName: {
            readonly method: "PATCH";
            readonly url: "/org/:orgId/name";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly params: {
                readonly name: t.StringType;
            };
        };
        readonly setPlan: {
            readonly method: "PATCH";
            readonly url: "/org/:orgId/plan";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly params: {
                readonly name: t.LiteralType<"BETA">;
            };
        };
        readonly inviteMembers: {
            readonly method: "POST";
            readonly url: "/org/:orgId/members";
            readonly urlParams: {
                readonly orgId: t.StringType;
            };
            readonly params: {
                readonly emails: t.ArrayType<string>;
            };
        };
    };
    readonly employeesOnly: {
        readonly growthDash: {
            readonly method: "GET";
            readonly url: "/employees-only/growth-dash";
            readonly response: {
                readonly values: t.ArrayType<string[]>;
                readonly config: t.ArrayType<string[]>;
            };
        };
    };
};
export default API_ROUTES;
