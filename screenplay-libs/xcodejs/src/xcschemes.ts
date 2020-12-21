import * as fs from "fs-extra";
import * as path from "path";
import convert from "xml-js";
import PBXNativeTarget from "./pbx_native_target";

export function schemeExists(projectPath: string, schemeName: string) {
  const schemesFolder = path.join(projectPath, "xcshareddata", "xcschemes");
  const appSchemePath = path.join(schemesFolder, schemeName + ".xcscheme");

  return fs.existsSync(schemesFolder) && fs.existsSync(appSchemePath);
}

export function createSchema(opts: {
  projectPath: string;
  srcSchemeName: string;
  srcAppTarget: PBXNativeTarget;
  newBuildTarget: PBXNativeTarget;
  buildableNameExtension: "app" | "framework";
}): string {
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

    const newSchemeName =
      opts.buildableNameExtension === "framework"
        ? `Screenplay-Framework-${opts.srcSchemeName}`
        : `Screenplay-${opts.srcSchemeName}`;

    if (opts.buildableNameExtension === "app") {
      fs.writeFileSync(
        path.join(schemesFolder, `${newSchemeName}.xcscheme`),
        createAppScheme(
          `${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`,
          opts.newBuildTarget.name(),
          opts.newBuildTarget._id,
          path.basename(opts.projectPath)
        )
      );
      return newSchemeName;
    } else if (fs.existsSync(appSchemePath)) {
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

function createAppScheme(
  buildableName: string,
  blueprintName: string,
  blueprintIdentifier: string,
  container: string
): string {
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
      } else if (
        attributes["BlueprintIdentifier"] != options.blueprintIdentifier
      ) {
      }
    }
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

  fs.writeFileSync(appSchemePath, convert.js2xml(defn, { compact: true }));
}
