#! /usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const ncp_1 = __importDefault(require("ncp"));
const path_1 = __importDefault(require("path"));
const TEST_OUTPUT_DIR = path_1.default.join(__dirname, "../test-output");
fs_extra_1.default.emptyDirSync(TEST_OUTPUT_DIR);
ncp_1.default(path_1.default.join(__dirname, "../../test-apps/duckduckgo"), TEST_OUTPUT_DIR, () => {
    process.chdir(path_1.default.join(__dirname, ".."));
    child_process_1.execSync(`ts-node ./src/index.ts install "${path_1.default.join(TEST_OUTPUT_DIR, "DuckDuckGo.xcodeproj")}"`, { stdio: ["pipe", process.stdout, "pipe"] });
    console.log(chalk_1.default.greenBright(`Test passed, output in ${TEST_OUTPUT_DIR}`));
});
//# sourceMappingURL=test-duckduck.js.map