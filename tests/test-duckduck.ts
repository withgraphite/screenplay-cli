#! /usr/bin/env ts-node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

const TEST_OUTPUT_DIR = "./test-output/";

fs.emptyDirSync(TEST_OUTPUT_DIR);
process.chdir(TEST_OUTPUT_DIR);
execSync("git clone https://github.com/duckduckgo/iOS .", { stdio: "inherit" });
execSync("git submodule update --init --recursive", { stdio: "inherit" });
execSync("carthage bootstrap --platform iOS", { stdio: "inherit" });

process.chdir(path.join(__dirname, ".."));
execSync(
  `ts-node ./src/index.ts install "${path.join(
    TEST_OUTPUT_DIR,
    "DuckDuckGo.xcodeproj"
  )}"`,
  { stdio: ["pipe", process.stdout, "pipe"] }
);
