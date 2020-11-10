import * as t from "retype";
declare const API_ROUTES: {
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
        readonly buildPhaseDownloader: {
            readonly method: "GET";
            readonly url: "/app-secret/:appSecret/build-phase-downloader";
            readonly urlParams: {
                readonly appSecret: t.StringType;
            };
        };
    };
    readonly createFramework: {
        readonly method: "POST";
        readonly url: "/app-secret/:appSecret/frameworks";
        readonly urlParams: {
            readonly appSecret: t.StringType;
        };
        readonly params: {
            readonly semVar: t.StringType;
            readonly name: t.StringType;
        };
        readonly response: {
            readonly id: t.StringType;
        };
    };
    readonly uploadFramework: {
        readonly method: "PUT";
        readonly url: "/framework/:frameworkId";
        readonly urlParams: {
            readonly frameworkId: t.StringType;
        };
        readonly params: {
            readonly appSecret: t.StringType;
        };
        readonly response: {
            readonly presignedUrl: t.UnionType<string, null>;
        };
    };
    readonly latestFramework: {
        readonly method: "GET";
        readonly url: "/frameworks/latest";
        readonly queryParams: {
            readonly appSecret: t.StringType;
        };
        readonly response: {
            readonly frameworkUrl: t.StringType;
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
        readonly create: {
            readonly method: "POST";
            readonly url: "/new-app/:newAppToken";
            readonly urlParams: {
                readonly newAppToken: t.StringType;
            };
            readonly params: {
                readonly name: t.StringType;
            };
            readonly response: {
                readonly appSecret: t.StringType;
            };
        };
        readonly updateAppIcon: {
            readonly method: "PUT";
            readonly url: "/app-secret/:appSecret/app-icon";
            readonly urlParams: {
                readonly appSecret: t.StringType;
            };
            readonly rawBody: true;
        };
        readonly createRelease: {
            readonly method: "POST";
            readonly url: "/app-secret/:appSecret/releases";
            readonly urlParams: {
                readonly appSecret: t.StringType;
            };
            readonly params: {
                readonly versions: t.ArrayType<{
                    embeddedId: number;
                    versionId: string;
                }>;
            };
            readonly response: {
                readonly releaseSecret: t.StringType;
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
                }, {
                    name: string;
                    icon: string | null;
                    store: "IOS";
                }>;
                readonly name: t.StringType;
                readonly created: t.NumberType;
                readonly adoption: t.NumberType;
                readonly timeline: t.ArrayType<{
                    actor: {
                        firstName: string;
                        lastName: string;
                        profilePicture: string | null;
                    } | null;
                    date: number;
                    event: {
                        kind: "CREATED";
                    } | {
                        kind: "RELEASED";
                    } | {
                        kind: "RULES_CHANGED";
                        beforeRuleSetId: string;
                        afterRuleSetId: string;
                    };
                }>;
                readonly versions: t.ArrayType<{
                    id: string;
                    name: string;
                    color: string;
                }>;
            };
        };
        readonly releaseRollbacks: {
            readonly method: "GET";
            readonly url: "/app/:appId/release/:releaseId/rollbacks";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly releaseId: t.StringType;
                readonly rollbackRuleSetId: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly rollbackRules: t.ArrayType<{
                    id: string;
                    targetVersionId: string;
                    conditions: ({
                        kind: "DEVICE";
                    } | {
                        kind: "OS";
                    })[];
                }>;
                readonly everyoneElseVersionId: t.StringType;
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
                readonly mostRecentReleases: t.ArrayType<{
                    id: string;
                    name: string;
                    users: number;
                }>;
            };
        };
        readonly releases: {
            readonly method: "GET";
            readonly url: "/app/:appId/releases";
            readonly urlParams: {
                readonly appId: t.StringType;
                readonly beforeDate: t.UnionType<string, undefined>;
            };
            readonly response: {
                readonly releases: t.ArrayType<{
                    id: string;
                    name: string;
                    createdAt: number;
                    users: number;
                    versions: {
                        name: string;
                        receivingTraffic: boolean;
                    }[];
                }>;
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
                profilePicture: string | undefined;
                email: string;
                mostRecentAppId: string | undefined;
                apps: {
                    id: string;
                    name: string;
                    icon: string | undefined;
                }[];
            }, undefined>;
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
            }, {
                firstName: string;
                lastName: string;
                profilePicture: string | undefined;
                email: string;
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
        readonly flags: {
            readonly method: "POST";
            readonly url: "/intercut/:releaseSecret/flags";
            readonly urlParams: {
                readonly releaseSecret: t.StringType;
            };
            readonly params: {
                readonly persistId: t.StringType;
                readonly os: t.StringType;
                readonly device: t.StringType;
            };
            readonly response: {
                readonly version: t.NumberType;
            };
        };
        readonly telemetry: {
            readonly method: "POST";
            readonly url: "/intercut/:releaseSecret/telemetry";
            readonly urlParams: {
                readonly releaseSecret: t.StringType;
            };
            readonly params: {
                readonly kind: t.LiteralType<"ERROR">;
                readonly errorKind: t.StringType;
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
        readonly completeSetup: {
            readonly method: "POST";
            readonly url: "/user/me/setup";
        };
        readonly acknowledgeOrgs: {
            readonly method: "POST";
            readonly url: "/user/me/acknowledge-orgs";
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
};
export default API_ROUTES;