import * as t from "retype";
import { request, TRoute } from "shared-routes";

const API_SERVER =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/v1"
    : "https://api.screenplay.dev/v1";

export function endpointWithArgs<TActualRoute extends TRoute>(
  route: TActualRoute & {
    method: "GET";
  },
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>
): string {
  return request.endpointWithArgs(API_SERVER, route, queryParams, urlParams);
}

export function requestWithArgs<TActualRoute extends TRoute>(
  route: TActualRoute,
  params: TActualRoute["rawBody"] extends true
    ? Buffer
    : t.UnwrapSchemaMap<TActualRoute["params"]>,
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>
): Promise<t.UnwrapSchemaMap<TActualRoute["response"]>> {
  return request.requestWithArgs(
    API_SERVER,
    route,
    params,
    queryParams,
    urlParams
  );
}
