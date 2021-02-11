#!/usr/bin/env node
import chalk from "chalk";
import { request, telemetry } from "shared-routes";
import yargs from "yargs";
import { debugMetadata } from "./commands/debug";
import { install } from "./commands/install";
import { installVersionBundle } from "./commands/install_version_bundle";
import { reinstall } from "./commands/reinstall";
import { uninstall } from "./commands/uninstall";

process.on("uncaughtException", async (err) => {
  await request.requestWithArgs(
    "https://screenplaylogs.com/v1",
    telemetry.cli,
    {
      name: typeof err === "string" ? err : err.name || "",
      message: err.message || "",
      stack: err.stack || "",
      argv: process.argv,
    }
  );

  process.exit(1);
});

export type BaseArgs = {
  "xcode-project": string;
};

export type AddTargetArgs = BaseArgs & {
  "app-target"?: string;
  "app-scheme"?: string;
  workspace?: string;
};

export type InstallArgs = AddTargetArgs & {
  "app-config-name"?: string;
  "with-tests": boolean;
} & (
    | { key: string; appToken: undefined }
    | { key: undefined; appToken: string }
  );

export type InstallVersionBundleArgs = AddTargetArgs & {
  destination: string;
  "app-version": string;
};

yargs
  .command(
    "install",
    "Add Screenplay to the specified Xcode project. This command requires a Screenplay app token, which can be found at https://screenplay.dev/create-app",
    (yargs) => {
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
          describe:
            "Whether to include tests to ensure the app boots properly. This is primarily just used to debug installations and during automated tests.",
          default: false,
          demandOption: false,
        })
        .option("key", {
          type: "string",
          describe:
            "The secret key, specific to your organization, that allows you to create a new app.",
        })
        .option("appToken", {
          type: "string",
          describe:
            "An app token that's already been issued for this app (typically only used when reinstalling Screenplay on an XCode project).",
        })
        .check((argv) => {
          return (
            (argv["key"] || argv["appToken"]) &&
            !(argv["key"] && argv["appToken"])
          );
        });
    },
    (argv) => {
      return install(argv as any);
    }
  )
  .command(
    "version-bundle",
    "Add version bundle target",
    (yargs) => {
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
    },
    (argv) => {
      return installVersionBundle(
        (argv as unknown) as InstallVersionBundleArgs
      );
    }
  )
  .command(
    "uninstall <xcode-project>",
    "Remove Screenplay entirely from the specified xcode project",
    (yargs) => {
      yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
      });
    },
    (argv) => {
      uninstall(argv["xcode-project"] as string);
    }
  )
  .command(
    "reinstall <xcode-project>",
    "Reinstall Screenplay on the specified xcode project",
    (yargs) => {
      yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
      });
    },
    (argv) => {
      reinstall(argv["xcode-project"] as string);
    }
  )
  .command(
    "debug-metadata <xcode-project>",
    "Print the detected name and icon for an xcode project",
    (yargs) => {
      yargs.positional("xcode-project", {
        describe: "The Xcode project to install Screenplay on",
      });
      yargs.option("app-target", {
        describe: "The name of the target which builds your app",
      });
    },
    (argv) => {
      debugMetadata(
        argv["xcode-project"] as string,
        argv["app-target"] as string
      );
    }
  )
  .usage(
    [
      "  ____                                 _             ",
      " / ___|  ___ _ __ ___  ___ _ __  _ __ | | __ _ _   _ ",
      " \\___ \\ / __| '__/ _ \\/ _ \\ '_ \\| '_ \\| |/ _` | | | |",
      "  ___) | (__| | |  __/  __/ | | | |_) | | (_| | |_| |",
      " |____/ \\___|_|  \\___|\\___|_| |_| .__/|_|\\__,_|\\__, |",
      "                                |_|            |___/ ",
      `Create confidently - ${chalk.cyanBright(
        "Sign up at https://screenplay.dev"
      )}`,
      "",
      "The Screenplay CLI helps you add and remove Screenplay",
      "from your Xcode projects.",
    ].join("\n")
  )
  .strict()
  .demandCommand().argv;
