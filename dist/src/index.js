#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const shared_routes_1 = require("shared-routes");
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const debug_1 = require("./commands/debug");
const install_1 = require("./commands/install");
const reinstall_1 = require("./commands/reinstall");
const uninstall_1 = require("./commands/uninstall");
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    yield shared_routes_1.request.requestWithArgs("https://screenplaylogs.com/v1", shared_routes_1.telemetry.cli, {
        name: typeof err === "string" ? err : err.name || "",
        message: err.message || "",
        stack: err.stack || "",
        argv: process.argv,
    });
    process.exit(1);
}));
yargs_1.default
    .command("install", "Add Screenplay to the specified Xcode project. This command requires a Screenplay app token, which can be found at https://screenplay.dev/create-app", (yargs) => {
    yargs
        .option("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
        type: "string",
        demandOption: true,
    })
        .option("app-target", {
        describe: "The name of the target which builds your app for release",
        type: "string",
        demandOption: false,
    })
        .option("with-tests", {
        type: "boolean",
        describe: "Whether to include tests to ensure the app boots properly. This is primarily just used to debug installations and during automated tests.",
        default: false,
        demandOption: false,
        hidden: true,
    })
        .option("always-enable", {
        type: "boolean",
        describe: "Whether to ALWAYS build with Screenplay (regardless of the build configuration).",
        default: false,
        demandOption: false,
        hidden: true,
    })
        .option("install-token", {
        type: "string",
        describe: "The Screenplay app token that allows you to create a new app (you can get a new app token from https://screenplay.dev/create-app).",
    })
        .option("app-secret", {
        type: "string",
        hidden: true,
        describe: "An app secret that's already been issued for this app (typically only used when reinstalling Screenplay on an XCode project - this is different from the installation token).",
    })
        .option("accept-prompts-for-ci", {
        type: "boolean",
        alias: "y",
        hidden: true,
        default: false,
        describe: "Automatically accept any prompts",
    })
        .check((argv) => {
        return ((argv["install-token"] || argv["app-secret"]) &&
            !(argv["install-token"] && argv["app-secret"]));
    });
}, (argv) => {
    return install_1.install(argv);
})
    .command("uninstall <xcode-project>", "Remove Screenplay entirely from the specified Xcode project", (yargs) => {
    yargs
        .positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
    })
        .option("app-target", {
        describe: "The name of the target which builds your app for release",
        type: "string",
        demandOption: false,
    });
}, (argv) => {
    uninstall_1.uninstall(argv["xcode-project"], argv["app-target"]);
})
    .command("reinstall <xcode-project>", "Reinstall Screenplay on the specified Xcode project", (yargs) => {
    yargs
        .positional("xcode-project", {
        describe: "The Xcode project to reinstall Screenplay on",
    })
        .option("app-target", {
        describe: "The name of the target which builds your app for release",
        type: "string",
        demandOption: false,
    })
        .option("accept-prompts-for-ci", {
        type: "boolean",
        alias: "y",
        hidden: true,
        default: false,
        describe: "Automatically accept any prompts",
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield reinstall_1.reinstall(argv["xcode-project"], argv["accept-prompts-for-ci"], argv["app-target"]);
}))
    .command("debug-metadata <xcode-project>", false, (yargs) => {
    yargs.positional("xcode-project", {
        describe: "The Xcode project you're attempting to install Screenplay on",
    });
    yargs.option("app-target", {
        describe: "The name of the target which builds your app for release",
    });
}, (argv) => {
    debug_1.debugMetadata(argv["xcode-project"], argv["app-target"]);
})
    .usage([
    "  ____                                 _             ",
    " / ___|  ___ _ __ ___  ___ _ __  _ __ | | __ _ _   _ ",
    " \\___ \\ / __| '__/ _ \\/ _ \\ '_ \\| '_ \\| |/ _` | | | |",
    "  ___) | (__| | |  __/  __/ | | | |_) | | (_| | |_| |",
    " |____/ \\___|_|  \\___|\\___|_| |_| .__/|_|\\__,_|\\__, |",
    "                                |_|            |___/ ",
    `The rewind button for your iOS releases - ${chalk_1.default.cyanBright("Sign up at https://screenplay.dev")}`,
    "",
    "The Screenplay CLI helps you add and remove Screenplay",
    "from your Xcode projects.",
].join("\n"))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map