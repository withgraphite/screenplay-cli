"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWithArgs = exports.endpointWithArgs = void 0;
const shared_routes_1 = require("shared-routes");
function endpointWithArgs(route, queryParams, urlParams) {
    return shared_routes_1.request.endpointWithArgs(shared_routes_1.API_SERVER, route, queryParams, urlParams);
}
exports.endpointWithArgs = endpointWithArgs;
function requestWithArgs(route, params, queryParams, urlParams, headers) {
    return shared_routes_1.request.requestWithArgs(shared_routes_1.API_SERVER, route, params, queryParams, urlParams, headers);
}
exports.requestWithArgs = requestWithArgs;
//# sourceMappingURL=api.js.map