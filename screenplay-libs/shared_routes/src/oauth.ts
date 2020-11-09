import * as t from "retype";
import { asRouteTree } from "./base";

const OAUTH_ROUTES = asRouteTree({
  githubWebhook: {
    method: "POST",
    url: "/github-app/hook",
    rawBody: true,
  },

  google: {
    start: {
      method: "GET",
      url: "/oauth/google/start",
      queryParams: {
        next: t.string,
        nextErr: t.string,
      },
    },
    complete: {
      method: "GET",
      url: "/oauth/google/complete",
      queryParams: {
        code: t.optional(t.string),
        error: t.optional(t.string),
        state: t.string,
      },
    },
  },
} as const);

export default OAUTH_ROUTES;
