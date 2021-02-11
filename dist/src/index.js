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
const yargs_1 = __importDefault(require("yargs"));
const debug_1 = require("./commands/debug");
const install_1 = require("./commands/install");
const install_version_bundle_1 = require("./commands/install_version_bundle");
const reinstall_1 = require("./commands/reinstall");
const uninstall_1 = require("./commands/uninstall");
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
        describe: "The name of the target which builds your app",
        type: "string",
        demandOption: false,
    })
        .option("app-scheme", {
        describe: "The name of the scheme which builds your app",
        type: "string",
        demandOption: false,
    })
        .option("workspace", {
        describe: "The workspace you use to build the app",
        type: "string",
        default: undefined,
        demandOption: false,
    })
        .option("with-tests", {
        type: "boolean",
        describe: "Whether to include tests to ensure the app boots properly. This is primarily just used to debug installations and during automated tests.",
        default: false,
        demandOption: false,
    })
        .option("key", {
        type: "string",
        describe: "The secret key, specific to your organization, that allows you to create a new app.",
    })
        .option("appToken", {
        type: "string",
        describe: "An app token that's already been issued for this app (typically only used when reinstalling Screenplay on an XCode project).",
    })
        .check((argv) => {
        return ((argv["key"] || argv["appToken"]) &&
            !(argv["key"] && argv["appToken"]));
    });
}, (argv) => {
    return install_1.install(argv);
})
    .command("version-bundle", "Add version bundle target", (yargs) => {
    yargs
        .option("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
        type: "string",
        demandOption: true,
    })
        .option("destination", {
        describe: "Where to write the finished version bundle to",
        type: "string",
        demandOption: true,
    })
        .option("app-target", {
        describe: "The name of the target which builds your app",
        type: "string",
        demandOption: false,
    })
        .option("app-version", {
        describe: "The version to show up in the info plist",
        type: "string",
        demandOption: true,
    })
        .option("app-scheme", {
        describe: "The name of the scheme which builds your app",
        type: "string",
        demandOption: false,
    })
        .option("workspace", {
        describe: "The workspace you use to build the app",
        type: "string",
        default: undefined,
        demandOption: false,
    });
}, (argv) => {
    return install_version_bundle_1.installVersionBundle(argv);
})
    .command("uninstall <xcode-project>", "Remove Screenplay entirely from the specified xcode project", (yargs) => {
    yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
    });
}, (argv) => {
    uninstall_1.uninstall(argv["xcode-project"]);
})
    .command("reinstall <xcode-project>", "Reinstall Screenplay on the specified xcode project", (yargs) => {
    yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
    });
}, (argv) => {
    reinstall_1.reinstall(argv["xcode-project"]);
})
    .command("debug-metadata <xcode-project>", "Print the detected name and icon for an xcode project", (yargs) => {
    yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
    });
    yargs.option("app-target", {
        describe: "The name of the target which builds your app",
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
    `Create confidently - ${chalk_1.default.cyanBright("Sign up at https://screenplay.dev")}`,
    "",
    "The Screenplay CLI helps you add and remove Screenplay",
    "from your Xcode projects.",
].join("\n"))
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map