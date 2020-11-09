import * as fs from "fs-extra";
import * as path from "path";
import convert from "xml-js";
import PBXNativeTarget from "./pbx_native_target";

export function createSchema(opts: {
  projectPath: string;
  srcSchemeName: string;
  srcAppTarget: PBXNativeTarget;
  newBuildTarget: PBXNativeTarget;
  buildableNameExtension: "app" | "framework";
}): string {
  console.log(opts);
  const schemesFolder = path.join(
    opts.projectPath,
    "xcshareddata",
    "xcschemes"
  );
  if (fs.existsSync(schemesFolder)) {
    const appSchemePath = path.join(
      schemesFolder,
      opts.srcSchemeName + ".xcscheme"
    );
    if (fs.existsSync(appSchemePath)) {
      const data = fs.readFileSync(appSchemePath);
      const defn: any = convert.xml2js(data.toString(), { compact: true });
      recursivelyMutateBuildRefs({
        defn: defn,
        buildableName: `${opts.newBuildTarget.name()}.${
          opts.buildableNameExtension
        }`,
        blueprintName: opts.newBuildTarget.name(),
        blueprintIdentifier: opts.newBuildTarget._id,
        originalBlueprintIdentifier: opts.srcAppTarget._id,
        projectPath: opts.projectPath,
      });

      const newSchemeName =
        opts.buildableNameExtension === "framework"
          ? `Screenplay-Framework-${opts.srcSchemeName}`
          : `Screenplay-${opts.srcSchemeName}`;

      fs.writeFileSync(
        path.join(schemesFolder, `${newSchemeName}.xcscheme`),
        convert.js2xml(defn, { compact: true })
      );
      return newSchemeName;
    } else {
      throw new Error(
        `XCSchemes found but could not find scheme ${opts.srcSchemeName}`
      );
    }
  }
  throw new Error(`No XCSchemes folder found at ${schemesFolder}`);
}

function recursivelyMutateBuildRefs(options: {
  defn: Record<string, any>;
  buildableName: string;
  blueprintName: string;
  blueprintIdentifier: string;
  originalBlueprintIdentifier: string;
  projectPath: string;
}) {
  Object.keys(options.defn).forEach((key) => {
    if (key === "_attributes" || key === "_declaration") {
      return;
    } else if (key === "BuildableReference") {
      const attributes = options.defn["BuildableReference"]["_attributes"];
      if (
        attributes["BlueprintIdentifier"] ===
        options.originalBlueprintIdentifier
      ) {
        attributes["BlueprintIdentifier"] = options.blueprintIdentifier;
        attributes["BuildableName"] = options.buildableName;
        attributes["BlueprintName"] = options.blueprintName;
        attributes["ReferencedContainer"] = `container:${path.basename(
          options.projectPath
        )}`;
      }
    } else {
      const value = options.defn[key];
      if (value instanceof Array) {
        value.forEach((innerValue: any) => {
          recursivelyMutateBuildRefs({
            defn: innerValue,
            buildableName: options.buildableName,
            blueprintName: options.blueprintName,
            blueprintIdentifier: options.blueprintIdentifier,
            originalBlueprintIdentifier: options.originalBlueprintIdentifier,
            projectPath: options.projectPath,
          });
        });
      } else if (value instanceof Object) {
        recursivelyMutateBuildRefs({
          defn: value,
          buildableName: options.buildableName,
          blueprintName: options.blueprintName,
          blueprintIdentifier: options.blueprintIdentifier,
          originalBlueprintIdentifier: options.originalBlueprintIdentifier,
          projectPath: options.projectPath,
        });
      } else {
        throw new Error(`Unknown literal "${key}" found in xcscheme parse`);
      }
    }
  });
}

function validateSchemePath(projectPath: string, appScheme: string) {
  const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
  if (!fs.existsSync(schemesFolder)) {
    throw new Error(`No XCSchemes folder found at ${schemesFolder}`);
  }
  const appSchemePath = path.join(schemesFolder, `${appScheme}.xcscheme`);
  if (!fs.existsSync(appSchemePath)) {
    throw new Error(
      `XCSchemes found but could not find a scheme for the scheme ("${appScheme}")`
    );
  }
}

export function addTests(opts: {
  projectPath: string;
  appScheme: string;
  nativeTargetID: string;
  xcodeFileName: string;
}) {
  validateSchemePath(opts.projectPath, opts.appScheme);
  const schemesFolder = path.join(
    opts.projectPath,
    "xcshareddata",
    "xcschemes"
  );
  const appSchemePath = path.join(schemesFolder, `${opts.appScheme}.xcscheme`);
  const data = fs.readFileSync(appSchemePath);
  const defn: any = convert.xml2js(data.toString(), { compact: true });

  const testableReference =
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"];

  if (!testableReference) {
    // no testable references exist, add a new empty array of them.
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];
  } else if (!Array.isArray(testableReference)) {
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

  fs.writeFileSync(appSchemePath, convert.js2xml(defn, { compact: true }));
}
