"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWithArgs = exports.endpointWithArgs = void 0;
const shared_routes_1 = require("shared-routes");
const API_SERVER = process.env.NODE_ENV === "development"
    ? "http://localhost:8000/v1"
    : "https://api.screenplay.dev/v1";
function endpointWithArgs(route, queryParams, urlParams) {
    return shared_routes_1.request.endpointWithArgs(API_SERVER, route, queryParams, urlParams);
}
exports.endpointWithArgs = endpointWithArgs;
function requestWithArgs(route, params, queryParams, urlParams) {
    return shared_routes_1.request.requestWithArgs(API_SERVER, route, params, queryParams, urlParams);
}
exports.requestWithArgs = requestWithArgs;
//# sourceMappingURL=api.js.map