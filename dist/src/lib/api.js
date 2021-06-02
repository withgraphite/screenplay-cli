"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWithArgs = exports.endpointWithArgs = void 0;
const shared_routes_1 = require("shared-routes");
function apiServer() {
    return process.env.NODE_ENV == "development"
        ? shared_routes_1.localhostApiServerWithPort(process.env.NODE_PORT || "8000")
        : shared_routes_1.API_SERVER;
}
function endpointWithArgs(route, queryParams, urlParams) {
    return shared_routes_1.request.endpointWithArgs(apiServer(), route, queryParams, urlParams);
}
exports.endpointWithArgs = endpointWithArgs;
function requestWithArgs(route, params, queryParams, urlParams, headers) {
    return shared_routes_1.request.requestWithArgs(apiServer(), route, params, queryParams, urlParams, headers);
}
exports.requestWithArgs = requestWithArgs;
//# sourceMappingURL=api.js.map