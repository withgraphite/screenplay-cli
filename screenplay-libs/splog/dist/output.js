"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPLog = void 0;
const chalk_1 = __importDefault(require("chalk"));
var SPLog;
(function (SPLog) {
    function errorAndExit(msg) {
        console.log(chalk_1.default.yellow(`ERROR: ${msg}`));
        process.exit(1);
    }
    SPLog.errorAndExit = errorAndExit;
    function warn(msg) {
        console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
    }
    SPLog.warn = warn;
    function info(msg) {
        console.log(chalk_1.default.blueBright(`${msg}`));
    }
    SPLog.info = info;
    function success(msg) {
        console.log(chalk_1.default.green(`${msg}`));
    }
    SPLog.success = success;
})(SPLog = exports.SPLog || (exports.SPLog = {}));
//# sourceMappingURL=output.js.map