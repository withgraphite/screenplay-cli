"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_SERVER = void 0;
const API_LOCAL_PORT = process.env.NODE_PORT ? process.env.NODE_PORT : "8000";
exports.API_SERVER = process.env.NODE_ENV === "development"
    ? `http://localhost:${API_LOCAL_PORT}/v1`
    : "https://api.screenplay.dev/v1";
//# sourceMappingURL=server.js.map