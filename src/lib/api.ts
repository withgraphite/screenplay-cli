import * as t from "retype";
import {
  API_SERVER,
  localhostApiServerWithPort,
  request,
  TRoute,
} from "shared-routes";

function apiServer(): string {
  return process.env.NODE_ENV == "development"
    ? localhostApiServerWithPort(process.env.NODE_PORT || "8000")
    : API_SERVER;
}

export function endpointWithArgs<TActualRoute extends TRoute>(
  route: TActualRoute & {
    method: "GET";
  },
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>
): string {
  return request.endpointWithArgs(apiServer(), route, queryParams, urlParams);
}

export function requestWithArgs<TActualRoute extends TRoute>(
  route: TActualRoute,
  params: TActualRoute["rawBody"] extends true
    ? Buffer
    : t.UnwrapSchemaMap<TActualRoute["params"]>,
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>,
  headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>
): Promise<
  t.UnwrapSchemaMap<TActualRoute["response"]> & { _response: Response }
> {
  return request.requestWithArgs(
    apiServer(),
    route,
    params,
    queryParams,
    urlParams,
    headers
  );
}
