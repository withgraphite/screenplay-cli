import * as t from "retype";
declare const OAUTH_ROUTES: {
    readonly githubWebhook: {
        readonly method: "POST";
        readonly url: "/github-app/hook";
        readonly rawBody: true;
    };
    readonly google: {
        readonly start: {
            readonly method: "GET";
            readonly url: "/oauth/google/start";
            readonly queryParams: {
                readonly next: t.StringType;
                readonly nextErr: t.StringType;
            };
        };
        readonly complete: {
            readonly method: "GET";
            readonly url: "/oauth/google/complete";
            readonly queryParams: {
                readonly code: t.UnionType<string, undefined>;
                readonly error: t.UnionType<string, undefined>;
                readonly state: t.StringType;
            };
        };
    };
};
export default OAUTH_ROUTES;
