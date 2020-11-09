import * as t from "retype";
declare const API_ROUTES: {
    readonly pixel: {
        readonly email: {
            readonly method: "GET";
            readonly url: "/pixel.gif";
            readonly queryParams: {
                readonly email: t.StringType;
                readonly utm_source: t.UnionType<string, undefined>;
                readonly utm_medium: t.UnionType<string, undefined>;
                readonly utm_campaign: t.UnionType<string, undefined>;
                readonly utm_content: t.UnionType<string, undefined>;
                readonly utm_term: t.UnionType<string, undefined>;
            };
        };
    };
};
export default API_ROUTES;
