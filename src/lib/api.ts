import * as t from "retype";
import { API_SERVER, request, TRoute } from "shared-routes";

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
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>,
  headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>
): Promise<t.UnwrapSchemaMap<TActualRoute["response"]>> {
  return request.requestWithArgs(
    API_SERVER,
    route,
    params,
    queryParams,
    urlParams,
    headers
  );
}
