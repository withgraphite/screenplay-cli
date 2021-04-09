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
exports.install = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../lib/utils");
const screenplay_target_1 = require("../targets/screenplay_target");
const test_target_1 = require("../targets/test_target");
function install(argv, versionBundleOnlyArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(argv["xcode-project"]);
        const xcodeFileName = path_1.default.basename(argv["xcode-project"]);
        const appTarget = utils_1.extractTarget(xcodeProject, argv["app-target"]);
        if (versionBundleOnlyArgs) {
            // Make sure to set synthetic versions on the version bundle source target (not the new one)
            appTarget
                .buildConfigurationList()
                .buildConfigs()
                .forEach((buildConfig) => {
                buildConfig.buildSettings()["MARKETING_VERSION"] =
                    versionBundleOnlyArgs["app-version"];
            });
        }
        const screenplayAppId = yield screenplay_target_1.addScreenplayAppTarget({
            xcodeProjectPath: argv["xcode-project"],
            xcodeProject: xcodeProject,
            appTarget: appTarget,
            newAppToken: argv["key"],
            appToken: argv["appToken"],
            workspacePath: argv["workspace"],
            withExtensions: argv["with-extensions"],
            withFromApp: argv["with-from-app"],
            alwaysEnable: argv["always-enable"],
            versionBundleDestination: versionBundleOnlyArgs && versionBundleOnlyArgs.destination,
        });
        if (argv["with-tests"]) {
            test_target_1.addTests({
                xcodeFileName,
                projectPath: argv["xcode-project"],
                workspacePath: argv["workspace"],
                xcodeProject,
                appTarget,
            });
        }
        xcodeProject.writeFileSync(path_1.default.join(argv["xcode-project"], "project.pbxproj"));
        console.log(chalk_1.default.cyanBright("Screenplay successfully installed!"));
        if (screenplayAppId) {
            console.log(`Visit https://screenplay.dev/app/${screenplayAppId} to manage rollbacks`);
        }
    });
}
exports.install = install;
//# sourceMappingURL=install.js.map