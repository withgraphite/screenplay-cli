"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_SERVER = exports.localhostApiServerWithPort = exports.PROD_API_SERVER = void 0;
const CURRENT_API_LOCAL_PORT = process.env.NODE_PORT
    ? process.env.NODE_PORT
    : "8000";
exports.PROD_API_SERVER = "https://api.screenplay.dev/v1";
function localhostApiServerWithPort(port) {
    return `http://localhost:${port}/v1`;
}
exports.localhostApiServerWithPort = localhostApiServerWithPort;
exports.API_SERVER = process.env.NODE_ENV === "development"
    ? localhostApiServerWithPort(CURRENT_API_LOCAL_PORT)
    : exports.PROD_API_SERVER;
//# sourceMappingURL=server.js.map