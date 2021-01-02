"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTests = exports.createSchema = exports.schemesAutomaticallyManaged = exports.schemeExists = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const xml_js_1 = __importDefault(require("xml-js"));
function schemeExists(projectPath, schemeName) {
    const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
    const appSchemePath = path.join(schemesFolder, schemeName + ".xcscheme");
    return fs.existsSync(schemesFolder) && fs.existsSync(appSchemePath);
}
exports.schemeExists = schemeExists;
function schemesAutomaticallyManaged(projectPath) {
    // TODO: We can likely do better by actually inspecting the project attributes in xcode... we'll worry about that later
    const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
    return !fs.existsSync(schemesFolder);
}
exports.schemesAutomaticallyManaged = schemesAutomaticallyManaged;
function createSchema(opts) {
    const schemesFolder = path.join(opts.projectPath, "xcshareddata", "xcschemes");
    if (fs.existsSync(schemesFolder)) {
        const appSchemePath = path.join(schemesFolder, opts.srcSchemeName + ".xcscheme");
        const newSchemeName = opts.buildableNameExtension === "framework"
            ? `Screenplay-Framework-${opts.srcSchemeName}`
            : `Screenplay-${opts.srcSchemeName}`;
        if (opts.buildableNameExtension === "app") {
            fs.writeFileSync(path.join(schemesFolder, `${newSchemeName}.xcscheme`), createAppScheme(`${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`, opts.newBuildTarget.name(), opts.newBuildTarget._id, path.basename(opts.projectPath)));
            return newSchemeName;
        }
        else if (fs.existsSync(appSchemePath)) {
            const data = fs.readFileSync(appSchemePath);
            const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
            recursivelyMutateBuildRefs({
                defn: defn,
                buildableName: `${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`,
                blueprintName: opts.newBuildTarget.name(),
                blueprintIdentifier: opts.newBuildTarget._id,
                originalBlueprintIdentifier: opts.srcAppTarget._id,
                projectPath: opts.projectPath,
            });
            fs.writeFileSync(path.join(schemesFolder, `${newSchemeName}.xcscheme`), xml_js_1.default.js2xml(defn, { compact: true }));
            return newSchemeName;
        }
        else {
            throw new Error(`XCSchemes found but could not find scheme ${opts.srcSchemeName}`);
        }
    }
    throw new Error(`No XCSchemes folder found at ${schemesFolder}`);
}
exports.createSchema = createSchema;
function createAppScheme(buildableName, blueprintName, blueprintIdentifier, container) {
    return `<?xml version="1.0" encoding="UTF-8"?>
  <Scheme LastUpgradeVersion="1160" version="1.3">
    <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="NO">
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
                attributes["ReferencedContainer"] = `container:${path.basename(options.projectPath)}`;
            }
            else if (attributes["BlueprintIdentifier"] != options.blueprintIdentifier) {
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
function validateSchemePath(projectPath, appScheme) {
    const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
    if (!fs.existsSync(schemesFolder)) {
        throw new Error(`No XCSchemes folder found at ${schemesFolder}`);
    }
    const appSchemePath = path.join(schemesFolder, `${appScheme}.xcscheme`);
    if (!fs.existsSync(appSchemePath)) {
        throw new Error(`XCSchemes found but could not find a scheme for the scheme ("${appScheme}")`);
    }
}
function addTests(opts) {
    if (schemesAutomaticallyManaged(opts.projectPath)) {
        return;
    }
    validateSchemePath(opts.projectPath, opts.appScheme);
    const schemesFolder = path.join(opts.projectPath, "xcshareddata", "xcschemes");
    const appSchemePath = path.join(schemesFolder, `${opts.appScheme}.xcscheme`);
    const data = fs.readFileSync(appSchemePath);
    const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"].push({
        _attributes: {
            skipped: "NO",
        },
        BuildableReference: {
            _attributes: {
                BuildableIdentifier: "primary",
                BlueprintIdentifier: opts.nativeTargetID,
                BuildableName: "ScreenplayUITests.xctest",
                BlueprintName: "ScreenplayUITests",
                ReferencedContainer: "container:" + opts.xcodeFileName,
            },
        },
    });
    fs.writeFileSync(appSchemePath, xml_js_1.default.js2xml(defn, { compact: true }));
}
exports.addTests = addTests;
//# sourceMappingURL=xcschemes.js.map