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
const t = __importStar(require("retype"));
const base_1 = require("./base");
const API_ROUTES = base_1.asRouteTree({
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
});
exports.default = API_ROUTES;
//# sourceMappingURL=assets.js.map