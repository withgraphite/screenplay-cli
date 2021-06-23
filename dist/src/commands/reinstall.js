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
exports.extractScreenplayReinstallDetails = exports.reinstall = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../lib/utils");
const install_1 = require("./install");
const uninstall_1 = require("./uninstall");
function reinstall(xcodeProjectPath, acceptPromptsForCi, appTargetName) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(xcodeProjectPath);
        const appTarget = utils_1.extractTarget(xcodeProject, appTargetName, true);
        // get details
        const installDetails = extractScreenplayReinstallDetails(xcodeProjectPath, xcodeProject, appTarget);
        installDetails["accept-prompts-for-ci"] = acceptPromptsForCi;
        // uninstall
        uninstall_1.removeScreenplayManagedTargetsAndProducts(xcodeProjectPath, xcodeProject, appTarget);
        xcodeProject.writeFileSync(path_1.default.join(xcodeProjectPath, "project.pbxproj"));
        // reinstall
        yield install_1.install(installDetails);
    });
}
exports.reinstall = reinstall;
function extractScreenplayReinstallDetails(xcodeProjectPath, xcodeProject, target) {
    let settings = target
        .buildConfigurationList()
        .buildConfigs()[0]
        .buildSettings();
    // Check if we're in V1
    if (!settings["SCREENPLAY_APP_KEY"]) {
        const screenplayTarget = xcodeProject.appTargets().find((t) => {
            return t.name() === "Screenplay-" + target.name();
        });
        if (!screenplayTarget) {
            throw Error("Could not identify an existing installation of Screenplay - please use the 'install' command instead.");
        }
        settings = screenplayTarget
            .buildConfigurationList()
            .buildConfigs()[0]
            .buildSettings();
    }
    return {
        "xcode-project": xcodeProjectPath,
        "app-target": target.name(),
        "with-tests": false,
        "install-token": undefined,
        "app-secret": settings["SCREENPLAY_APP_KEY"],
        "always-enable": false,
        "accept-prompts-for-ci": false,
    };
}
exports.extractScreenplayReinstallDetails = extractScreenplayReinstallDetails;
//# sourceMappingURL=reinstall.js.map