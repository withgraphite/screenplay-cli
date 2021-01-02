import * as t from "retype";
import { asRouteTree } from "./base";

/**
 * These are just intended for "sad-path" logging (i.e. places where
 * something has gone wrong). If you are trying to log metrics on things
 * which went well, please just hit our monolith directly.
 */

const API_ROUTES = asRouteTree({
  intercut: {
    method: "POST",
    url: "/intercut/:releaseSecret/telemetry",
    urlParams: {
      releaseSecret: t.string,
    },
    params: {
      kind: t.literal("ERROR" as const),
      errorKind: t.string,
    },
  },
  buildPhase: {
    method: "POST",
    url: "/error-logging/build-phase",
    params: {
      name: t.string,
      message: t.string,
      stack: t.string,
      argv: t.array(t.string),
    },
  },
  cli: {
    method: "POST",
    url: "/error-logging/cli",
    params: {
      name: t.string,
      message: t.string,
      stack: t.string,
      argv: t.array(t.string),
    },
  },
} as const);

export default API_ROUTES;
