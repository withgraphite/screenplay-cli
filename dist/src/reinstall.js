"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractScreenplayReinstallDetails = void 0;
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
            workspace: settings["SCREENPLAY_WORKSPACE"],
            "with-tests": false,
            key: undefined,
            appToken: settings["SCREENPLAY_APP_KEY"],
        };
    });
}
exports.extractScreenplayReinstallDetails = extractScreenplayReinstallDetails;
//# sourceMappingURL=reinstall.js.map