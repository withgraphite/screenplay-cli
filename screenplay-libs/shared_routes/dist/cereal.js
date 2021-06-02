"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.release = exports.actor = void 0;
const t = __importStar(require("retype"));
exports.actor = t.shape({
    firstName: t.string,
    lastName: t.string,
    profilePicture: t.nullable(t.string),
    email: t.string,
});
exports.release = t.shape({
    id: t.string,
    name: t.string,
    createdAt: t.number,
    users: t.number,
    majorVersion: t.number,
    minorVersion: t.number,
    patchVersion: t.number,
    status: t.literals([
        "IN_APP_STORE",
        "NOT_RELEASED",
        "RELEASE_CANDIDATE",
    ]),
    newerVersionInAppStore: t.boolean,
    releasedDate: t.nullable(t.number),
    versions: t.array(t.shape({
        name: t.string,
        receivingTraffic: t.boolean,
    })),
    buildReport: t.nullable(t.shape({
        buildRequest: t.shape({
            buildConfiguration: t.string,
            buildAction: t.string,
            author: t.nullable(exports.actor),
        }),
    })),
});
//# sourceMappingURL=cereal.js.map