import * as t from "retype";
export declare const actor: t.ShapeType<{
    firstName: t.StringType;
    lastName: t.StringType;
    profilePicture: t.UnionType<string, null>;
    email: t.StringType;
}, {
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    email: string;
}>;
export declare const release: t.ShapeType<{
    id: t.StringType;
    name: t.StringType;
    createdAt: t.NumberType;
    users: t.NumberType;
    majorVersion: t.NumberType;
    minorVersion: t.NumberType;
    patchVersion: t.NumberType;
    status: t.PluralUnionType<t.LiteralType<"IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">, "IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE">;
    newerVersionInAppStore: t.BooleanType;
    releasedDate: t.UnionType<number, null>;
    versions: t.ArrayType<{
        name: string;
        receivingTraffic: boolean;
    }>;
    buildReport: t.UnionType<{
        buildRequest: {
            buildConfiguration: string;
            buildAction: string;
            author: {
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                email: string;
            } | null;
        };
    }, null>;
}, {
    id: string;
    name: string;
    createdAt: number;
    users: number;
    majorVersion: number;
    minorVersion: number;
    patchVersion: number;
    status: "IN_APP_STORE" | "NOT_RELEASED" | "RELEASE_CANDIDATE";
    newerVersionInAppStore: boolean;
    releasedDate: number | null;
    versions: {
        name: string;
        receivingTraffic: boolean;
    }[];
    buildReport: {
        buildRequest: {
            buildConfiguration: string;
            buildAction: string;
            author: {
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                email: string;
            } | null;
        };
    } | null;
}>;
