"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVersionBundleScript = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
function generateVersionBundleScript(scheme, destination, workspace) {
    return [
        `${process.env.GITHUB_WORKSPACE
            ? process.env.GITHUB_WORKSPACE
            : path_1.default.join(os_1.default.homedir(), "monologue")}/build-phase/dist/build-phase.latest.pkg`,
        `build-version-bundle`,
        `--scheme ${scheme}`,
        `--destination ${destination}`,
        workspace ? `--workspace ${workspace}` : "",
    ].join(" ");
}
exports.generateVersionBundleScript = generateVersionBundleScript;
//# sourceMappingURL=version_bundle_run_script.js.map