/// <reference types="node" />
import * as t from "retype";
import { TRoute } from "shared-routes";
export declare function endpointWithArgs<TActualRoute extends TRoute>(route: TActualRoute & {
    method: "GET";
}, queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>, urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>): string;
export declare function requestWithArgs<TActualRoute extends TRoute>(route: TActualRoute, params: TActualRoute["rawBody"] extends true ? Buffer : t.UnwrapSchemaMap<TActualRoute["params"]>, queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>, urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>, headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>): Promise<t.UnwrapSchemaMap<TActualRoute["response"]>>;
