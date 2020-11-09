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
const t = __importStar(require("retype"));
const base_1 = require("./base");
const API_ROUTES = base_1.asRouteTree({
    health: {
        method: "GET",
        url: "/health",
    },
    requestDemo: {
        method: "POST",
        url: "/request-demo",
        params: {
            email: t.string,
        },
    },
    scripts: {
        buildPhaseDownloader: {
            method: "GET",
            url: "/app-secret/:appSecret/build-phase-downloader",
            urlParams: {
                appSecret: t.string,
            },
        },
    },
    createFramework: {
        method: "POST",
        url: "/app-secret/:appSecret/frameworks",
        urlParams: {
            appSecret: t.string,
        },
        params: {
            semVar: t.string,
            name: t.string,
        },
        response: {
            id: t.string,
        },
    },
    uploadFramework: {
        method: "PUT",
        url: "/framework/:frameworkId",
        urlParams: {
            frameworkId: t.string,
        },
        params: {
            appSecret: t.string,
        },
        response: {
            presignedUrl: t.nullable(t.string),
        },
    },
    latestFramework: {
        method: "GET",
        url: "/frameworks/latest",
        queryParams: {
            appSecret: t.string,
        },
        response: {
            frameworkUrl: t.string,
        },
    },
    demo: {
        toggleRelease: {
            method: "POST",
            url: "/demo/toggle-release",
            params: {
                version: t.number,
            },
        },
    },
    auth: {
        logout: {
            method: "DELETE",
            url: "/auth",
        },
    },
    apps: {
        generateCLI: {
            method: "GET",
            url: "/org/:orgId/create-app-cli",
            urlParams: {
                orgId: t.string,
            },
            response: {
                org: t.shape({
                    name: t.string,
                }),
                newAppToken: t.string,
            },
        },
        create: {
            method: "POST",
            url: "/new-app/:newAppToken",
            urlParams: {
                newAppToken: t.string,
            },
            params: {
                name: t.string,
            },
            response: {
                appSecret: t.string,
            },
        },
        updateAppIcon: {
            method: "PUT",
            url: "/app-secret/:appSecret/app-icon",
            urlParams: {
                appSecret: t.string,
            },
            rawBody: true,
        },
        createRelease: {
            method: "POST",
            url: "/app-secret/:appSecret/releases",
            urlParams: {
                appSecret: t.string,
            },
            params: {
                versions: t.array(t.shape({
                    embeddedId: t.number,
                    versionId: t.string,
                })),
            },
            response: {
                releaseSecret: t.string,
            },
        },
    },
    app: {
        release: {
            method: "GET",
            url: "/app/:appId/release/:releaseId",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
            },
            response: {
                app: t.shape({
                    name: t.string,
                    icon: t.nullable(t.string),
                    store: t.literals(["IOS"]),
                }),
                name: t.string,
                created: t.number,
                adoption: t.number,
                timeline: t.array(t.shape({
                    actor: t.nullable(t.shape({
                        firstName: t.string,
                        lastName: t.string,
                        profilePicture: t.nullable(t.string),
                    })),
                    date: t.number,
                    event: t.unionMany([
                        t.shape({
                            kind: t.literal("CREATED"),
                        }),
                        t.shape({
                            kind: t.literal("RELEASED"),
                        }),
                        t.shape({
                            kind: t.literal("RULES_CHANGED"),
                            beforeRuleSetId: t.string,
                            afterRuleSetId: t.string,
                        }),
                    ]),
                })),
                versions: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    color: t.string,
                })),
            },
        },
        releaseRollbacks: {
            method: "GET",
            url: "/app/:appId/release/:releaseId/rollbacks",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
                rollbackRuleSetId: t.optional(t.string),
            },
            response: {
                rollbackRules: t.array(t.shape({
                    id: t.string,
                    targetVersionId: t.string,
                    conditions: t.array(t.unionMany([
                        t.shape({
                            kind: t.literal("DEVICE"),
                        }),
                        t.shape({
                            kind: t.literal("OS"),
                        }),
                    ])),
                })),
                everyoneElseVersionId: t.string,
            },
        },
        releasesHeader: {
            method: "GET",
            url: "/app/:appId/releases-header",
            urlParams: {
                appId: t.string,
            },
            response: {
                name: t.string,
                icon: t.nullable(t.string),
                store: t.literal("IOS"),
                totalUsers: t.number,
                totalReleases: t.number,
                mostRecentReleases: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    users: t.number,
                })),
            },
        },
        releases: {
            method: "GET",
            url: "/app/:appId/releases",
            urlParams: {
                appId: t.string,
                beforeDate: t.optional(t.string),
            },
            response: {
                releases: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    createdAt: t.number,
                    users: t.number,
                    versions: t.array(t.shape({
                        name: t.string,
                        receivingTraffic: t.boolean,
                    })),
                })),
            },
        },
    },
    bootstrap: {
        method: "GET",
        url: "/bootstrap",
        response: {
            user: t.optional(t.shape({
                id: t.string,
                onboardingComplete: t.boolean,
                firstName: t.string,
                lastName: t.string,
                profilePicture: t.optional(t.string),
                email: t.string,
                mostRecentAppId: t.optional(t.string),
                apps: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    icon: t.optional(t.string),
                })),
            })),
        },
    },
    onboarding: {
        method: "GET",
        url: "/onboarding",
        response: {
            state: t.union(t.literal("ACCOUNT"), t.union(t.literal("ORG"), t.union(t.literal("ALLSET"), t.literal("DONE")))),
            user: t.shape({
                firstName: t.string,
                lastName: t.string,
                profilePicture: t.optional(t.string),
                email: t.string,
            }),
            teams: t.array(t.shape({
                id: t.string,
                name: t.string,
                domain: t.nullable(t.string),
                admin: t.boolean,
                apps: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    icon: t.optional(t.string),
                })),
                plan: t.optional(t.literal("BETA")),
            })),
        },
    },
    intercut: {
        flags: {
            method: "POST",
            url: "/intercut/:releaseSecret/flags",
            urlParams: {
                releaseSecret: t.string,
            },
            params: {
                persistId: t.string,
                os: t.string,
                device: t.string,
            },
            response: {
                version: t.number,
            },
        },
        telemetry: {
            method: "POST",
            url: "/intercut/:releaseSecret/telemetry",
            urlParams: {
                releaseSecret: t.string,
            },
            params: {
                kind: t.literal("ERROR"),
                errorKind: t.string,
            },
        },
    },
    user: {
        updateProfilePicture: {
            method: "PUT",
            url: "/user/profile-picture",
            rawBody: true,
        },
        orgs: {
            method: "GET",
            url: "/user/orgs",
            response: {
                orgs: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    admin: t.boolean,
                    apps: t.array(t.shape({
                        id: t.string,
                        name: t.string,
                        icon: t.optional(t.string),
                    })),
                })),
            },
        },
        settings: {
            method: "GET",
            url: "/user/settings",
            response: {
                id: t.string,
                firstName: t.string,
                lastName: t.string,
                profilePicture: t.optional(t.string),
                email: t.string,
                domain: t.nullable(t.string),
                orgs: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    admin: t.boolean,
                    apps: t.array(t.shape({
                        id: t.string,
                        name: t.string,
                        icon: t.optional(t.string),
                    })),
                })),
            },
        },
        updateName: {
            method: "PATCH",
            url: "/user/me/name",
            params: {
                firstName: t.string,
                lastName: t.string,
            },
        },
        completeSetup: {
            method: "POST",
            url: "/user/me/setup",
        },
        acknowledgeOrgs: {
            method: "POST",
            url: "/user/me/acknowledge-orgs",
        },
        completeOnboarding: {
            method: "POST",
            url: "/user/me/complete-onboarding",
        },
    },
    org: {
        settings: {
            method: "GET",
            url: "/org/:orgId/settings",
            urlParams: {
                orgId: t.string,
            },
            response: {
                id: t.string,
                name: t.string,
                admin: t.boolean,
                domain: t.nullable(t.string),
            },
        },
        members: {
            method: "GET",
            url: "/org/:orgId/members",
            urlParams: {
                orgId: t.string,
            },
            response: {
                members: t.array(t.shape({
                    id: t.string,
                    firstName: t.string,
                    lastName: t.string,
                    admin: t.boolean,
                    profilePicture: t.optional(t.string),
                })),
                invites: t.array(t.shape({
                    id: t.string,
                    email: t.string,
                })),
            },
        },
        promoteAdmin: {
            method: "POST",
            url: "/org/:orgId/admins",
            urlParams: {
                orgId: t.string,
            },
            params: {
                userId: t.string,
            },
        },
        demoteAdmin: {
            method: "DELETE",
            url: "/org/:orgId/admin/:userId",
            urlParams: {
                orgId: t.string,
                userId: t.string,
            },
            response: {
                success: t.boolean,
            },
        },
        leave: {
            method: "DELETE",
            url: "/org/:orgId/membership",
            urlParams: {
                orgId: t.string,
            },
            response: {
                success: t.boolean,
            },
        },
        removeMember: {
            method: "DELETE",
            url: "/org/:orgId/member/:userId",
            urlParams: {
                orgId: t.string,
                userId: t.string,
            },
        },
        anyoneWithDomainCanJoin: {
            method: "POST",
            url: "/org/:orgId/domain",
            urlParams: {
                orgId: t.string,
            },
        },
        anyoneWithDomainCanNotJoin: {
            method: "DELETE",
            url: "/org/:orgId/domain",
            urlParams: {
                orgId: t.string,
            },
        },
        revokeInvite: {
            method: "DELETE",
            url: "/org/:orgId/invite/:inviteId",
            urlParams: {
                orgId: t.string,
                inviteId: t.string,
            },
        },
        setName: {
            method: "PATCH",
            url: "/org/:orgId/name",
            urlParams: {
                orgId: t.string,
            },
            params: {
                name: t.string,
            },
        },
        setPlan: {
            method: "PATCH",
            url: "/org/:orgId/plan",
            urlParams: {
                orgId: t.string,
            },
            params: {
                name: t.literal("BETA"),
            },
        },
        inviteMembers: {
            method: "POST",
            url: "/org/:orgId/members",
            urlParams: {
                orgId: t.string,
            },
            params: {
                emails: t.array(t.string),
            },
        },
    },
});
exports.default = API_ROUTES;
//# sourceMappingURL=api.js.map