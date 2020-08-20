#! /usr/bin/env ts-node

import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

const TEST_OUTPUT_DIR = "/tmp/screenplay/test/cli/";

fs.emptyDirSync(TEST_OUTPUT_DIR);
process.chdir(TEST_OUTPUT_DIR);
execSync("git clone https://github.com/screenplaydev/test-apps .", {
  stdio: "inherit",
});

process.chdir(path.join(__dirname, ".."));
execSync(
  `ts-node ./src/index.ts install "${path.join(
    TEST_OUTPUT_DIR,
    "duckduckgo/DuckDuckGo.xcodeproj"
  )}"`,
  { stdio: ["pipe", process.stdout, "pipe"] }
);
console.log(chalk.greenBright(`Test passed, output in ${TEST_OUTPUT_DIR}`));
