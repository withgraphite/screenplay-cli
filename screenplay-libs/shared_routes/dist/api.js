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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("retype"));
const base_1 = require("./base");
const ff_1 = __importDefault(require("./ff"));
const API_ROUTES = base_1.asRouteTree({
    featureFlags: {
        method: "GET",
        url: "/feature-flags",
        response: ff_1.default,
    },
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
    versionBundles: {
        upload: {
            method: "POST",
            url: "/app-secret/:appSecret/versions",
            queryParams: {},
            urlParams: {
                appSecret: t.string,
            },
            params: {
                semver: t.string,
                name: t.string,
                archs: t.array(t.string),
                isRelease: t.boolean,
                buildPhaseVersion: t.string,
                kind: t.literals(["app", "source"]),
            },
            response: {
                id: t.string,
                presignedUrl: t.nullable(t.string),
            },
        },
        markUploadComplete: {
            method: "POST",
            url: "/app-secret/:appSecret/version/:versionId/upload-complete",
            urlParams: {
                appSecret: t.string,
                versionId: t.string,
            },
        },
        downloadLatest: {
            method: "GET",
            url: "/app-secret/:appSecret/version-bundles",
            urlParams: {
                appSecret: t.string,
            },
            queryParams: {
                archs: t.string,
                maxSemver: t.string,
            },
            response: {
                versionBundles: t.array(t.shape({
                    id: t.string,
                    url: t.string,
                    kind: t.literals(["app", "source"]),
                })),
            },
        },
        download: {
            method: "GET",
            url: "/version-bundles/:semver",
            urlParams: {
                semver: t.string,
            },
            queryParams: {
                appSecret: t.string,
                archs: t.string,
            },
            response: {
                versionBundleId: t.string,
                versionBundleUrl: t.string,
                versionBundleKind: t.literals(["app", "source"]),
            },
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
                id: t.string,
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
                    id: t.string,
                })),
            },
            response: {
                id: t.string,
                releaseSecret: t.string,
            },
        },
        buildMetadata: {
            method: "POST",
            url: "/app-secret/:appSecret/build-metadata",
            urlParams: {
                appSecret: t.string,
            },
            params: {
                latestVersionSizeInKb: t.number,
                totalBundleSizeInKb: t.number,
                latestVersionTimeInS: t.number,
                totalBundleTimeInS: t.number,
                bundleId: t.string,
                releaseId: t.string,
                buildPhaseVersion: t.string,
                archs: t.array(t.string),
                isRelease: t.boolean,
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
                    totalUsers: t.number,
                }),
                name: t.string,
                created: t.number,
                userCount: t.number,
                timeline: t.array(t.shape({
                    actor: t.nullable(t.shape({
                        firstName: t.string,
                        lastName: t.string,
                        profilePicture: t.nullable(t.string),
                    })),
                    date: t.number,
                    event: t.shape({
                        kind: t.literals(["CREATED", "RULES_CHANGED"]),
                    }),
                    note: t.nullable(t.string),
                    beforeRuleSetId: t.string,
                    afterRuleSetId: t.string,
                })),
                versions: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    color: t.string,
                })),
            },
        },
        releaseAppOpens: {
            method: "GET",
            url: "/app/:appId/release/:releaseId/app-opens",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
            },
            response: {
                datapoints: t.array(t.shape({
                    time: t.number,
                    versions: t.array(t.shape({
                        id: t.string,
                        appOpens: t.number,
                    })),
                })),
            },
        },
        releaseRollbacks: {
            method: "GET",
            url: "/app/:appId/release/:releaseId/rollbacks",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
            },
            queryParams: {
                rollbackRuleSetId: t.optional(t.string),
            },
            response: {
                rollbackRules: t.array(t.shape({
                    targetVersionId: t.string,
                    conditions: t.array(t.unionMany([
                        t.shape({
                            op: t.literal("DEVICE_MATCHES"),
                            matches: t.string,
                        }),
                        t.shape({
                            op: t.literal("OS_MATCHES"),
                            matches: t.string,
                        }),
                    ])),
                })),
                everyoneElseVersionId: t.string,
            },
        },
        saveReleaseRollbacks: {
            method: "PUT",
            url: "/app/:appId/release/:releaseId/rollbacks",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
            },
            params: {
                rollbackRules: t.array(t.shape({
                    targetVersionId: t.string,
                    conditions: t.array(t.unionMany([
                        t.shape({
                            op: t.literal("DEVICE_MATCHES"),
                            matches: t.string,
                        }),
                        t.shape({
                            op: t.literal("OS_MATCHES"),
                            matches: t.string,
                        }),
                    ])),
                })),
                everyoneElseVersionId: t.string,
            },
        },
        releaseRollbacksConditionTypeahead: {
            method: "GET",
            url: "/app/:appId/release/:releaseId/rollbacks/conditions",
            urlParams: {
                appId: t.string,
                releaseId: t.string,
            },
            queryParams: {
                q: t.string,
            },
            response: {
                conditions: t.array(t.unionMany([
                    t.shape({
                        op: t.literal("DEVICE_MATCHES"),
                        matches: t.string,
                    }),
                    t.shape({
                        op: t.literal("OS_MATCHES"),
                        matches: t.string,
                    }),
                ])),
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
            },
            queryParams: {
                beforeDate: t.optional(t.string),
            },
            response: {
                releases: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    createdAt: t.number,
                    users: t.number,
                    builtForRelease: t.boolean,
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
                employee: t.boolean,
                profilePicture: t.optional(t.string),
                email: t.string,
                mostRecentAppId: t.optional(t.string),
                apps: t.array(t.shape({
                    id: t.string,
                    name: t.string,
                    icon: t.optional(t.string),
                    store: t.literals(["IOS"]),
                    org: t.shape({
                        name: t.string,
                    }),
                })),
            })),
        },
    },
    docs: {
        page: {
            method: "GET",
            url: "/docs/page",
            queryParams: {
                // can't put the slug in the URL b/c parameters with "/"s are only supported by path-to-regexp > 1.0,
                // and express is pinned to 0.17
                slug: t.string,
            },
            response: {
                id: t.string,
                title: t.string,
                text: t.string,
                published: t.boolean,
            },
        },
        pages: {
            method: "GET",
            url: "/docs/pages",
            response: {
                pages: t.array(t.shape({
                    id: t.string,
                    title: t.string,
                    published: t.boolean,
                    slug: t.string,
                })),
            },
        },
        navbar: {
            method: "GET",
            url: "/docs/navbar",
            response: {
                entries: t.array(t.shape({
                    page: t.nullable(t.shape({
                        slug: t.string,
                        pageId: t.string,
                    })),
                    title: t.string,
                    realTitle: t.nullable(t.string),
                    depth: t.number,
                })),
            },
        },
        createPage: {
            method: "POST",
            url: "/docs/pages",
            response: {
                slug: t.string,
            },
        },
        editPage: {
            method: "PUT",
            url: "/docs/page-id/:id",
            urlParams: {
                id: t.string,
            },
            params: {
                slug: t.string,
                title: t.string,
                text: t.string,
                published: t.boolean,
            },
        },
        deletePage: {
            method: "DELETE",
            url: "/docs/page-id/:id",
            urlParams: {
                id: t.string,
            },
        },
        editNavbar: {
            method: "PUT",
            url: "/docs/navbar",
            params: {
                entries: t.array(t.shape({
                    pageId: t.nullable(t.string),
                    title: t.nullable(t.string),
                    depth: t.number,
                })),
            },
        },
    },
    blogs: {
        page: {
            method: "GET",
            url: "/blog/post/:id",
            urlParams: {
                id: t.string,
            },
            response: {
                title: t.string,
                text: t.string,
                published: t.boolean,
                createdAt: t.number,
                wordCount: t.number,
            },
        },
        pages: {
            method: "GET",
            url: "/blog/posts",
            response: {
                pages: t.array(t.shape({
                    id: t.string,
                    title: t.string,
                    published: t.boolean,
                    createdAt: t.number,
                    wordCount: t.number,
                })),
            },
        },
        createPage: {
            method: "POST",
            url: "/blog/posts",
            response: {
                id: t.string,
            },
        },
        editPage: {
            method: "PUT",
            url: "/blog/post/:id",
            urlParams: {
                id: t.string,
            },
            params: {
                title: t.string,
                text: t.string,
                published: t.boolean,
            },
        },
        deletePage: {
            method: "DELETE",
            url: "/blog/post/:id",
            urlParams: {
                id: t.string,
            },
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
                bootedVersion: t.optional(t.number),
            },
            response: {
                version: t.number,
                backgroundTerminationEnabled: t.boolean,
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