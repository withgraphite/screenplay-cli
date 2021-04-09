import * as t from "retype";
export declare type TRoute = {
    url: string;
    response?: {
        [key: string]: t.Schema<unknown>;
    };
    urlParams?: {
        [key: string]: t.Schema<string>;
    };
    queryParams?: {
        [key: string]: t.Schema<string | undefined>;
    };
    headers?: {
        [key: string]: t.Schema<string | undefined>;
    };
} & (({
    method: "POST" | "PATCH" | "DELETE" | "PUT";
} & ({
    params?: {
        [key: string]: t.Schema<unknown>;
    };
    rawBody?: false;
} | {
    rawBody: true;
    params?: null;
})) | {
    method: "GET";
    params?: null;
    rawBody?: false;
});
export declare type TRouteTree = {
    [key: string]: TRoute | TRouteTree;
};
