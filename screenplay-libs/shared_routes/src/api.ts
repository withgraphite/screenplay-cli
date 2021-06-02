import * as t from "retype";
import { asRouteTree } from "./base";
import { release } from "./cereal";
import { default as ff } from "./ff";

const API_ROUTES = asRouteTree({
  featureFlags: {
    method: "GET",
    url: "/feature-flags",
    response: ff,
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
    // TODO: To be deleted once all early clients reinstall
    buildPhaseDownloaderOld: {
      method: "GET",
      url: "/app-secret/:appSecret/build-phase-downloader",
      urlParams: {
        appSecret: t.string,
      },
    },
    buildPhaseDownloader: {
      method: "GET",
      url: "/build-phase-downloader",
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
    },
  },
  buildAuthor: {
    bind: {
      method: "POST",
      url: "/build-author/link",
      queryParams: {},
      params: {
        authorId: t.string,
        releaseId: t.string,
      },
    },
  },
  versionBundles: {
    upload: {
      method: "POST",
      url: "/app/versions",
      queryParams: {},
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
      params: {
        semver: t.string,
        name: t.string,
        archs: t.array(t.string),
        isRelease: t.boolean,
        buildPhaseVersion: t.string,
        kind: t.literals(["app", "source"] as const),
      },
      response: {
        id: t.string,
        presignedUrl: t.nullable(t.string),
      },
    },
    markUploadComplete: {
      method: "POST",
      url: "/app/version/:versionId/upload-complete",
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
      urlParams: {
        versionId: t.string,
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
    getSecret: {
      method: "GET",
      url: "/app/secret",
      urlParams: {},
      queryParams: {
        newAppToken: t.string,
        bundleIdentifier: t.string,
      },
      response: {
        appSecret: t.optional(t.string),
      },
    },
    create: {
      method: "POST",
      url: "/new-app/:newAppToken",
      urlParams: {
        newAppToken: t.string,
      },
      params: {
        bundleIdentifier: t.optional(t.string),
        name: t.string,
      },
      response: {
        id: t.string,
        appSecret: t.string,
      },
    },
    updateAppIcon: {
      method: "PUT",
      url: "/app/icon",
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
      rawBody: true,
    },
    createBuild: {
      method: "POST",
      url: "/app/builds",
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
      params: {
        versions: t.array(t.string),
        includeDefaultVersions: t.boolean,
        maxSemverForDefaultVersions: t.string,
        archs: t.array(t.string),
        withFallbackVersion: t.optional(t.string),
        plistOverrides: t.optional(t.array(t.string)),
        buildAuthor: t.optional(t.string),
        buildAction: t.optional(t.string),
        buildConfiguration: t.optional(t.string),
        clobberPaths: t.optional(t.array(t.string)),
      },
      response: {
        id: t.string,
      },
    },
  },
  build: {
    status: {
      method: "GET",
      url: "/build/:buildId/status",
      urlParams: {
        buildId: t.string,
      },
      headers: {
        "X-SP-APP-SECRET": t.string,
      },
      response: {
        status: t.literals([
          "BOOTING",
          "WORKING",
          "SUCCESS",
          "FAILURE",
        ] as const),
        downloadURL: t.optional(t.string),
        appId: t.optional(t.string),
        releaseId: t.optional(t.string),
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
          store: t.literals(["IOS"] as const),
          totalUsers: t.nullable(t.number),
        }),
        name: t.string,
        created: t.number,
        userCount: t.nullable(t.number),
        size: t.nullable(t.number),
        status: t.literals([
          "IN_APP_STORE",
          "NOT_RELEASED",
          "RELEASE_CANDIDATE",
        ] as const),
        newerVersionInAppStore: t.boolean,
        releasedDate: t.nullable(t.number),
        buildReport: t.nullable(
          t.shape({
            buildRequest: t.shape({
              buildConfiguration: t.string,
              buildAction: t.string,
              author: t.nullable(
                t.shape({
                  firstName: t.string,
                  lastName: t.string,
                  profilePicture: t.nullable(t.string),
                  email: t.string,
                })
              ),
            }),
            didFallback: t.boolean,
            fallbackReason: t.optional(t.string),
          })
        ),
        timeline: t.array(
          t.shape({
            actor: t.nullable(
              t.shape({
                firstName: t.string,
                lastName: t.string,
                profilePicture: t.nullable(t.string),
                email: t.string,
              })
            ),
            date: t.number,
            event: t.shape({
              kind: t.literals(["CREATED", "RULES_CHANGED"] as const),
            }),
            note: t.nullable(t.string),
            beforeRuleSetId: t.string,
            afterRuleSetId: t.string,
          })
        ),
        versions: t.array(
          t.shape({
            id: t.string,
            name: t.string,
            color: t.string,
            size: t.nullable(t.number),
            fileSizeTreeURL: t.nullable(t.string),
            receivingTraffic: t.boolean,
            default: t.boolean,
          })
        ),
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
        datapoints: t.array(
          t.shape({
            time: t.number,
            versions: t.array(
              t.shape({
                id: t.string,
                appOpens: t.number,
              })
            ),
          })
        ),
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
        rollbackRules: t.array(
          t.shape({
            targetVersionId: t.string,
            conditions: t.array(
              t.unionMany([
                t.shape({
                  op: t.literal("DEVICE_MATCHES" as const),
                  matches: t.string,
                }),
                t.shape({
                  op: t.literal("OS_MATCHES" as const),
                  matches: t.string,
                }),
              ])
            ),
          })
        ),
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
        rollbackRules: t.array(
          t.shape({
            targetVersionId: t.string,
            conditions: t.array(
              t.unionMany([
                t.shape({
                  op: t.literal("DEVICE_MATCHES" as const),
                  matches: t.string,
                }),
                t.shape({
                  op: t.literal("OS_MATCHES" as const),
                  matches: t.string,
                }),
              ])
            ),
          })
        ),
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
        conditions: t.array(
          t.unionMany([
            t.shape({
              op: t.literal("DEVICE_MATCHES" as const),
              matches: t.string,
            }),
            t.shape({
              op: t.literal("OS_MATCHES" as const),
              matches: t.string,
            }),
          ])
        ),
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
        store: t.literal("IOS" as const),
        totalUsers: t.number,
        totalReleases: t.number,
        totalBuilds: t.number,
        mostRecentReleases: t.array(
          t.shape({
            id: t.string,
            name: t.string,
            users: t.number,
          })
        ),
      },
    },

    buildsAfterLatestRelease: {
      method: "GET",
      url: "/app/:appId/new-releases",
      urlParams: {
        appId: t.string,
      },
      queryParams: {
        beforeDate: t.optional(t.string),
      },
      response: {
        releases: t.array(release),
      },
    },

    buildsBeforeLatestRelease: {
      method: "GET",
      url: "/app/:appId/previous-releases",
      urlParams: {
        appId: t.string,
      },
      queryParams: {
        beforeDate: t.optional(t.string),
        beforeMajorVersion: t.optional(t.string),
        beforeMinorVersion: t.optional(t.string),
        beforePatchVersion: t.optional(t.string),
      },
      response: {
        releases: t.array(release),
      },
    },

    releasesInAppStore: {
      method: "GET",
      url: "/app/:appId/app-store-releases",
      urlParams: {
        appId: t.string,
      },
      queryParams: {
        beforeMajorVersion: t.optional(t.string),
        beforeMinorVersion: t.optional(t.string),
        beforePatchVersion: t.optional(t.string),
      },
      response: {
        releases: t.array(release),
      },
    },

    releasesForSemver: {
      method: "GET",
      url: "/app/:appId/semver/:semver",
      urlParams: {
        appId: t.string,
        semver: t.string,
      },
      response: {
        releases: t.array(
          t.shape({
            id: t.string,
            name: t.string,
            createdAt: t.number,
            users: t.number,
            released: t.boolean,
          })
        ),
        releaseDate: t.nullable(t.number),
      },
    },
    updateReleaseForSemver: {
      method: "PUT",
      url: "/app/:appId/semver/:semver",
      urlParams: {
        appId: t.string,
        semver: t.string,
      },
      params: {
        id: t.nullable(t.string),
        releaseDate: t.nullable(t.number),
      },
    },
  },
  bootstrap: {
    method: "GET",
    url: "/bootstrap",
    response: {
      user: t.optional(
        t.shape({
          id: t.string,
          onboardingComplete: t.boolean,
          firstName: t.string,
          lastName: t.string,
          employee: t.boolean,
          profilePicture: t.optional(t.string),
          email: t.string,
          mostRecentAppId: t.optional(t.string),
          apps: t.array(
            t.shape({
              id: t.string,
              name: t.string,
              icon: t.optional(t.string),
              store: t.literals(["IOS"] as const),
              org: t.shape({
                name: t.string,
              }),
            })
          ),
        })
      ),
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
        pages: t.array(
          t.shape({
            id: t.string,
            title: t.string,
            published: t.boolean,
            slug: t.string,
          })
        ),
      },
    },
    navbar: {
      method: "GET",
      url: "/docs/navbar",
      response: {
        entries: t.array(
          t.shape({
            page: t.nullable(
              t.shape({
                slug: t.string,
                pageId: t.string,
              })
            ),
            title: t.string,
            realTitle: t.nullable(t.string),
            depth: t.number,
          })
        ),
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
        entries: t.array(
          t.shape({
            pageId: t.nullable(t.string),
            title: t.nullable(t.string),
            depth: t.number,
          })
        ),
      },
    },
  },
  blogs: {
    latestPost: {
      method: "GET",
      url: "/blog/lastest-post",
      response: {
        id: t.string,
      },
    },
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
        publishedAt: t.nullable(t.number),
        author: t.nullable(
          t.shape({
            firstName: t.string,
            lastName: t.string,
            profilePicture: t.nullable(t.string),
            email: t.nullable(t.string),
          })
        ),
      },
    },
    pages: {
      method: "GET",
      url: "/blog/posts",
      response: {
        pages: t.array(
          t.shape({
            id: t.string,
            title: t.string,
            published: t.boolean,
            createdAt: t.number,
            wordCount: t.number,
          })
        ),
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
        publishedAt: t.nullable(t.number),
        authorEmail: t.nullable(t.string),
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
      state: t.union(
        t.literal("ACCOUNT" as const),
        t.union(
          t.literal("ORG" as const),
          t.union(t.literal("ALLSET" as const), t.literal("DONE" as const))
        )
      ),
      user: t.shape({
        firstName: t.string,
        lastName: t.string,
        profilePicture: t.optional(t.string),
        email: t.string,
        domain: t.nullable(t.string),
      }),
      teams: t.array(
        t.shape({
          id: t.string,
          name: t.string,
          domain: t.nullable(t.string),
          admin: t.boolean,
          apps: t.array(
            t.shape({
              id: t.string,
              name: t.string,
              icon: t.optional(t.string),
            })
          ),
          plan: t.optional(t.literal("BETA" as const)),
        })
      ),
    },
  },
  intercut: {
    oldFlags: {
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
    flags: {
      method: "POST",
      url: "/intercut/flags",
      headers: {
        "X-SP-RELEASE-SECRET": t.string,
      },
      params: {
        persistId: t.string,
        os: t.string,
        device: t.string,
        bootedVersion: t.optional(t.number),
      },
      response: {
        version: t.number,
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
        orgs: t.array(
          t.shape({
            id: t.string,
            name: t.string,
            admin: t.boolean,
            apps: t.array(
              t.shape({
                id: t.string,
                name: t.string,
                icon: t.optional(t.string),
              })
            ),
          })
        ),
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
        orgs: t.array(
          t.shape({
            id: t.string,
            name: t.string,
            admin: t.boolean,
            apps: t.array(
              t.shape({
                id: t.string,
                name: t.string,
                icon: t.optional(t.string),
              })
            ),
          })
        ),
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
    createOrg: {
      method: "POST",
      url: "/orgs",
      params: {
        name: t.string,
        withDomain: t.boolean,
      },
      response: {
        orgId: t.string,
      },
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
        members: t.array(
          t.shape({
            id: t.string,
            firstName: t.string,
            lastName: t.string,
            admin: t.boolean,
            profilePicture: t.optional(t.string),
            email: t.string,
          })
        ),
        invites: t.array(
          t.shape({
            id: t.string,
            email: t.string,
          })
        ),
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
        name: t.literal("BETA" as const),
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
  employeesOnly: {
    growthDash: {
      method: "GET",
      url: "/employees-only/growth-dash",
      response: {
        values: t.array(t.array(t.string)),
      },
    },
  },
} as const);

export default API_ROUTES;
