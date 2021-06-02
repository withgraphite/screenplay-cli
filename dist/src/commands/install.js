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
const path_1 = __importDefault(require("path"));
const splog_1 = require("splog");
const utils_1 = require("../lib/utils");
const screenplay_target_1 = require("../targets/screenplay_target");
const test_target_1 = require("../targets/test_target");
function install(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(argv["xcode-project"]);
        const xcodeFileName = path_1.default.basename(argv["xcode-project"]);
        const appTarget = utils_1.extractTarget(xcodeProject, argv["app-target"]);
        const screenplayAppId = yield screenplay_target_1.addScreenplayAppTarget(Object.assign({ xcodeProjectPath: argv["xcode-project"], xcodeProject: xcodeProject, appTarget: appTarget, alwaysEnable: argv["always-enable"], acceptPrompts: argv["accept-prompts-for-ci"] }, (argv["install-token"]
            ? { installToken: argv["install-token"], appSecret: undefined }
            : {
                appSecret: argv["app-secret"],
                installToken: undefined,
            })));
        if (argv["with-tests"]) {
            test_target_1.addTests({
                xcodeFileName,
                projectPath: argv["xcode-project"],
                xcodeProject,
                appTarget,
            });
        }
        xcodeProject.writeFileSync(path_1.default.join(argv["xcode-project"], "project.pbxproj"));
        splog_1.logSuccess("Screenplay successfully installed!");
        if (screenplayAppId) {
            console.log(`Visit https://screenplay.dev/app/${screenplayAppId} to view Screenplay builds & roll back`);
        }
    });
}
exports.install = install;
//# sourceMappingURL=install.js.map