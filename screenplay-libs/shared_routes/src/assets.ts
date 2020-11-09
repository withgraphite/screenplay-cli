import * as t from "retype";
import { asRouteTree } from "./base";

const API_ROUTES = asRouteTree({
  pixel: {
    email: {
      method: "GET",
      url: "/pixel.gif",
      queryParams: {
        email: t.string,
        utm_source: t.optional(t.string),
        utm_medium: t.optional(t.string),
        utm_campaign: t.optional(t.string),
        utm_content: t.optional(t.string),
        utm_term: t.optional(t.string),
      },
    },
  },
} as const);

export default API_ROUTES;
