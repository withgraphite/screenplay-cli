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
function reinstall(xcodeProjectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const xcodeProject = utils_1.readProject(xcodeProjectPath);
        // get details
        const installDetails = extractScreenplayReinstallDetails(xcodeProjectPath, xcodeProject);
        // uninstall
        uninstall_1.removeScreenplayManagedTargetsAndProducts(xcodeProject);
        xcodeProject.writeFileSync(path_1.default.join(xcodeProjectPath, "project.pbxproj"));
        // reinstall
        yield installDetails.forEach((installDetail) => __awaiter(this, void 0, void 0, function* () {
            yield install_1.install(installDetail);
        }));
    });
}
exports.reinstall = reinstall;
function extractScreenplayReinstallDetails(xcodeProjectPath, xcodeProject) {
    return xcodeProject
        .rootObject()
        .targets()
        .filter((target) => {
        // TODO: At some point we should update this heuristic
        // (Maybe check a custom build setting or something)
        return target.name().startsWith("Screenplay-");
    })
        .map((target) => {
        const settings = target
            .buildConfigurationList()
            .buildConfigs()[0]
            .buildSettings();
        return {
            "xcode-project": xcodeProjectPath,
            "app-target": target.name().slice("Screenplay-".length),
            "app-scheme": settings["SCREENPLAY_SCHEME"],
            workspace: settings["SCREENPLAY_WORKSPACE"]
                ? path_1.default.join(path_1.default.dirname(xcodeProjectPath), settings["SCREENPLAY_WORKSPACE"])
                : settings["SCREENPLAY_WORKSPACE"],
            "with-tests": false,
            key: undefined,
            appToken: settings["SCREENPLAY_APP_KEY"],
            "with-extensions": !!settings["SCREENPLAY_EXP_EXTENSIONS"],
        };
    });
}
exports.extractScreenplayReinstallDetails = extractScreenplayReinstallDetails;
//# sourceMappingURL=reinstall.js.map