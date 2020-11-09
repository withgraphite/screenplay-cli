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
exports.addTests = exports.createSchema = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const xml_js_1 = __importDefault(require("xml-js"));
function createSchema(opts) {
    console.log(opts);
    const schemesFolder = path.join(opts.projectPath, "xcshareddata", "xcschemes");
    if (fs.existsSync(schemesFolder)) {
        const appSchemePath = path.join(schemesFolder, opts.srcSchemeName + ".xcscheme");
        if (fs.existsSync(appSchemePath)) {
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
            const newSchemeName = opts.buildableNameExtension === "framework"
                ? `Screenplay-Framework-${opts.srcSchemeName}`
                : `Screenplay-${opts.srcSchemeName}`;
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
        }
        else {
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
            else {
                throw new Error(`Unknown literal "${key}" found in xcscheme parse`);
            }
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
    validateSchemePath(opts.projectPath, opts.appScheme);
    const schemesFolder = path.join(opts.projectPath, "xcshareddata", "xcschemes");
    const appSchemePath = path.join(schemesFolder, `${opts.appScheme}.xcscheme`);
    const data = fs.readFileSync(appSchemePath);
    const defn = xml_js_1.default.xml2js(data.toString(), { compact: true });
    const testableReference = defn["Scheme"]["TestAction"]["Testables"]["TestableReference"];
    if (!testableReference) {
        // no testable references exist, add a new empty array of them.
        defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];
    }
    else if (!Array.isArray(testableReference)) {
        // no testable references exist, add a new empty array of them.
        defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [
            defn["Scheme"]["TestAction"]["Testables"]["TestableReference"],
        ];
    }
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