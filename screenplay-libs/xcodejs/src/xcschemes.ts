import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import convert from "xml-js";
import PBXNativeTarget from "./pbx_native_target";
import PBXProj from "./pbx_project";
import { PorkspacePath } from "./porkspace_type";

export function list(porkspacePath: PorkspacePath): string[] {
  const xcodeBuildOutput = JSON.parse(
    execSync(
      `xcodebuild ${
        porkspacePath.workspace
          ? `-workspace "${porkspacePath.workspace}"`
          : `-project "${porkspacePath.project}"`
      } -list -json`
    ).toString()
  );
  return (xcodeBuildOutput["project"] || xcodeBuildOutput["workspace"])[
    "schemes"
  ];
}

export function findSrcSchemePath(opts: {
  projectPath: string;
  workspacePath?: string;
  schemeName: string;
}): string | undefined {
  return [opts.projectPath]
    .concat(opts.workspacePath ? [opts.workspacePath] : [])
    .map((containerPath) =>
      path.join(
        containerPath,
        "xcshareddata",
        "xcschemes",
        `${opts.schemeName}.xcscheme`
      )
    )
    .find(fs.existsSync);
}

export function createSchema(opts: {
  projectPath: string;
  workspacePath?: string;
  srcSchemeName: string;
  srcAppTarget: PBXNativeTarget;
  newBuildTarget: PBXNativeTarget;
  buildableNameExtension: "app" | "framework";
}): string {
  const srcSchemePath = findSrcSchemePath({
    projectPath: opts.projectPath,
    workspacePath: opts.workspacePath,
    schemeName: opts.srcSchemeName,
  });
  if (!srcSchemePath) {
    throw Error(`Unable to find scheme ${opts.srcSchemeName}`);
  }
  const newSchemeName =
    opts.buildableNameExtension === "framework"
      ? `Screenplay-Framework-${opts.srcSchemeName}`
      : `Screenplay-${opts.srcSchemeName}`;

  if (opts.buildableNameExtension === "app") {
    // Make an app scheme
    fs.writeFileSync(
      path.join(path.dirname(srcSchemePath), `${newSchemeName}.xcscheme`),
      createAppScheme(
        `${opts.newBuildTarget.name()}.${opts.buildableNameExtension}`,
        opts.newBuildTarget.name(),
        opts.newBuildTarget._id,
        path.basename(opts.projectPath)
      )
    );
    return newSchemeName;
  } else {
    // Make a frameworks scheme
    const data = fs.readFileSync(srcSchemePath);
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
      path.join(path.dirname(srcSchemePath), `${newSchemeName}.xcscheme`),
      convert.js2xml(defn, { compact: true })
    );
    return newSchemeName;
  }
}

function createAppScheme(
  buildableName: string,
  blueprintName: string,
  blueprintIdentifier: string,
  container: string
): string {
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

export function removeAllTests(opts: {
  projectPath: string;
  workspacePath?: string;
  appScheme: string;
  project: PBXProj;
}) {
  const appSchemePath = findSrcSchemePath({
    projectPath: opts.projectPath,
    schemeName: opts.appScheme,
    workspacePath: opts.workspacePath,
  });
  if (!appSchemePath) {
    throw Error(`Failed to find scheme ${opts.appScheme}`);
  }
  const data = fs.readFileSync(appSchemePath);
  const defn: any = convert.xml2js(data.toString(), { compact: true });

  // If there is only one value (i.e. it's not an array), we can assume we
  // need to build that one
  if (
    Array.isArray(
      defn["Scheme"]["BuildAction"]["BuildActionEntries"]["BuildActionEntry"]
    )
  ) {
    defn["Scheme"]["BuildAction"]["BuildActionEntries"][
      "BuildActionEntry"
    ] = defn["Scheme"]["BuildAction"]["BuildActionEntries"][
      "BuildActionEntry"
    ].filter((entry) => {
      return !entry["BuildableReference"]["_attributes"][
        "BuildableName"
      ].endsWith("xctest");
    });
  }

  defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];

  fs.writeFileSync(appSchemePath, convert.js2xml(defn, { compact: true }));
}

export function addTests(opts: {
  projectPath: string;
  workspacePath?: string;
  appScheme: string;
  nativeTargetID: string;
  testTargetName: string;
  xcodeFileName: string;
}) {
  const appSchemePath = findSrcSchemePath({
    projectPath: opts.projectPath,
    schemeName: opts.appScheme,
    workspacePath: opts.workspacePath,
  });
  if (!appSchemePath) {
    throw Error(`Failed to find scheme ${opts.appScheme}`);
  }
  const data = fs.readFileSync(appSchemePath);
  const defn: any = convert.xml2js(data.toString(), { compact: true });

  if (
    !Array.isArray(
      defn["Scheme"]["TestAction"]["Testables"]["TestableReference"]
    )
  ) {
    const oldValue =
      defn["Scheme"]["TestAction"]["Testables"]["TestableReference"];
    defn["Scheme"]["TestAction"]["Testables"]["TestableReference"] = [];
    if (oldValue) {
      defn["Scheme"]["TestAction"]["Testables"]["TestableReference"].push(
        oldValue
      );
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

  fs.writeFileSync(appSchemePath, convert.js2xml(defn, { compact: true }));
}
