"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTests = exports.createSchema = exports.findSrcSchemePath = exports.list = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const xml_js_1 = __importDefault(require("xml-js"));
function list(porkspacePath) {
    const xcodeBuildOutput = JSON.parse(child_process_1.execSync(`xcodebuild ${porkspacePath.workspace
        ? `-workspace "${porkspacePath.workspace}"`
        : `-project "${porkspacePath.project}"`} -list -json`).toString());
    return (xcodeBuildOutput["project"] || xcodeBuildOutput["workspace"])["schemes"];
}
exports.list = list;
function findSrcSchemePath(opts) {
    return [opts.projectPath]
        .concat(opts.workspacePath ? [opts.workspacePath] : [])
        .map((containerPath) => path_1.default.join(containerPath, "xcshareddata", "xcschemes", `${opts.schemeName}.xcscheme`))
        .find(fs_extra_1.default.existsSync);
}
exports.findSrcSchemePath = findSrcSchemePath;
function createSchema(opts) {
    const srcSchemePath = findSrcSchemePath({
        projectPath: opts.projectPath,
        workspacePath: opts.workspacePath,
        schemeName: opts.srcSchemeName,
    });
    if (!srcSchemePath) {
        throw Error(`Unable to find scheme ${opts.srcSchemeName}`);
    }
    const newSchemeName = opts.buildableNameExtension === "framework"
        ? `Screenplay-Framework-${opts.srcSchemeName}`
        : `Screenplay-${opts.srcSchemeName}`;
    if (opts.buildableNameExtension === "app") {
        // Make an app scheme
        fs_extra_1.default.writeFileSync(path_1.default.join(path_1.default.dirname(srcSchemePath), `${newSchemeName}.xcscheme`), createAppScheme(`${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`, opts.newBuildTarget.name(), opts.newBuildTarget._id, path_1.default.basename(opts.projectPath)));
        return newSchemeName;
    }
    else {
        // Make a frameworks scheme
        const data = fs_extra_1.default.readFileSync(srcSchemePath);
        const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
        recursivelyMutateBuildRefs({
            defn: defn,
            buildableName: `${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`,
            blueprintName: opts.newBuildTarget.name(),
            blueprintIdentifier: opts.newBuildTarget._id,
            originalBlueprintIdentifier: opts.srcAppTarget._id,
            projectPath: opts.projectPath,
        });
        fs_extra_1.default.writeFileSync(path_1.default.join(path_1.default.dirname(srcSchemePath), `${newSchemeName}.xcscheme`), xml_js_1.default.js2xml(defn, { compact: true }));
        return newSchemeName;
    }
}
exports.createSchema = createSchema;
function createAppScheme(buildableName, blueprintName, blueprintIdentifier, container) {
    // NEED to build xcode implicit deps b/c that is an inherited property (i.e. if we set it to NO,
    // but we depend on their app, then we will try to build their app without implicit deps)
    return `<?xml version="1.0" encoding="UTF-8"?>
  <Scheme LastUpgradeVersion="1160" version="1.3">
    <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
      <BuildActionEntries>
        <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">
          <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${blueprintIdentifier}" BuildableName="${buildableName}" BlueprintName="${blueprintName}" ReferencedContainer="container:${container}" />
        </BuildActionEntry>
      </BuildActionEntries>
    </BuildAction>
    <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES">
      <Testables />
    </TestAction>
    <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES">
      <BuildableProductRunnable runnableDebuggingMode="0">
        <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${blueprintIdentifier}" BuildableName="${buildableName}" BlueprintName="${blueprintName}" ReferencedContainer="container:${container}" />
      </BuildableProductRunnable>
    </LaunchAction>
    <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES">
      <BuildableProductRunnable runnableDebuggingMode="0">
        <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${blueprintIdentifier}" BuildableName="${buildableName}" BlueprintName="${blueprintName}" ReferencedContainer="container:${container}" />
      </BuildableProductRunnable>
    </ProfileAction>
    <AnalyzeAction buildConfiguration="Debug" />
    <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES" />
  </Scheme>`;
}
function recursivelyMutateBuildRefs(options) {
    Object.keys(options.defn).forEach((key) => {
        if (key === "_attributes" || key === "_declaration") {
            return;
        }
        else if (key === "BuildableReference") {
            const attributes = options.defn["BuildableReference"]["_attributes"];
            if (attributes["BlueprintIdentifier"] ===
                options.originalBlueprintIdentifier) {
                attributes["BlueprintIdentifier"] = options.blueprintIdentifier;
                attributes["BuildableName"] = options.buildableName;
                attributes["BlueprintName"] = options.blueprintName;
                attributes["ReferencedContainer"] = `container:${path_1.default.basename(options.projectPath)}`;
            }
        }
        const value = options.defn[key];
        if (value instanceof Array) {
            value.forEach((innerValue) => {
                recursivelyMutateBuildRefs({
                    defn: innerValue,
                    buildableName: options.buildableName,
                    blueprintName: options.blueprintName,
                    blueprintIdentifier: options.blueprintIdentifier,
                    originalBlueprintIdentifier: options.originalBlueprintIdentifier,
                    projectPath: options.projectPath,
                });
            });
        }
        else if (value instanceof Object) {
            recursivelyMutateBuildRefs({
                defn: value,
                buildableName: options.buildableName,
                blueprintName: options.blueprintName,
                blueprintIdentifier: options.blueprintIdentifier,
                originalBlueprintIdentifier: options.originalBlueprintIdentifier,
                projectPath: options.projectPath,
            });
        }
    });
}
function addTests(opts) {
    const appSchemePath = findSrcSchemePath({
        projectPath: opts.projectPath,
        schemeName: opts.appScheme,
        workspacePath: opts.workspacePath,
    });
    if (!appSchemePath) {
        throw Error(`Failed to find scheme ${opts.appScheme}`);
    }
    const data = fs_extra_1.default.readFileSync(appSchemePath);
    const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
    if (!Array.isArray(defn["Scheme"]["TestAction"]["Testables"]["TestableReference"])) {
        const oldValue = defn["Scheme"]["TestAction"]["Testables"]["TestableReference"];
        defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];
        if (oldValue) {
            defn["Scheme"]["TestAction"]["Testables"]["TestableReference"].push(oldValue);
        }
    }
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"].push({
        _attributes: {
            skipped: "NO",
        },
        BuildableReference: {
            _attributes: {
                BuildableIdentifier: "primary",
                BlueprintIdentifier: opts.nativeTargetID,
                BuildableName: `${opts.testTargetName}.xctest`,
                BlueprintName: opts.testTargetName,
                ReferencedContainer: "container:" + opts.xcodeFileName,
            },
        },
    });
    fs_extra_1.default.writeFileSync(appSchemePath, xml_js_1.default.js2xml(defn, { compact: true }));
}
exports.addTests = addTests;
//# sourceMappingURL=xcschemes.js.map