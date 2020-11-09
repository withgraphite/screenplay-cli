"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.error = void 0;
const chalk_1 = __importDefault(require("chalk"));
function error(msg) {
    console.log(chalk_1.default.yellow(`ERROR: ${msg}`));
    process.exit(1);
}
exports.error = error;
function warn(msg) {
    console.log(chalk_1.default.yellow(`WARNING: ${msg}`));
}
exports.warn = warn;
//# sourceMappingURL=utils.js.map