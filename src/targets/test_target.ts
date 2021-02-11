#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import {
  PBXFileReference,
  PBXNativeTarget,
  PBXProject,
  Utils,
  XCSchemes,
} from "xcodejs";

export function addTests(opts: {
  xcodeFileName: string;
  projectPath: string;
  workspacePath?: string;
  xcodeProject: PBXProject;
  appTarget: PBXNativeTarget;
  appScheme: string;
}) {
  // Copy files
  const uiTestDir = path.join(opts.projectPath, "../ScreenplayUITests");
  fs.mkdirSync(uiTestDir);
  fs.copySync(path.join(__dirname, "../../assets/ui_test_src"), uiTestDir);

  // Add files
  const codeSourceId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][codeSourceId] = {
    path: "ScreenplayUITests.m",
    isa: "PBXFileReference",
    lastKnownFileType: "sourcecode.c.objc",
    sourceTree: "<group>",
  };
  const plistId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][plistId] = {
    path: "Info.plist",
    isa: "PBXFileReference",
    lastKnownFileType: "text.plist.xml",
    sourceTree: "<group>",
  };

  // Add group
  const group = opts.xcodeProject.createGroup("ScreenplayUITests");
  opts.xcodeProject.rootObject().mainGroup().addChild(group);
  group.addChildren([
    new PBXFileReference(plistId, opts.xcodeProject),
    new PBXFileReference(codeSourceId, opts.xcodeProject),
  ]);

  // Add product
  const xcTestId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][xcTestId] = {
    path: "ScreenplayUITests.xctest",
    isa: "PBXFileReference",
    includeInIndex: "0",
    explicitFileType: "wrapper.cfbundle",
    sourceTree: "BUILT_PRODUCTS_DIR",
  };
  const productRefGroupId = opts.xcodeProject.rootObject()._defn[
    "productRefGroup"
  ];
  opts.xcodeProject._defn["objects"][productRefGroupId]["children"].push(
    xcTestId
  );

  // Add target
  const buildFileId = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildFileId] = {
    isa: "PBXBuildFile",
    fileRef: codeSourceId,
  };

  const sourcesBuildPhaseId = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][sourcesBuildPhaseId] = {
    isa: "PBXSourcesBuildPhase",
    buildActionMask: "2147483647",
    files: [buildFileId],
    runOnlyForDeploymentPostprocessing: "0",
  };

  const testBuildConfigIds = opts.xcodeProject
    .rootObject()
    .buildConfigurationList()
    .buildConfigs()
    .map((buildConfig) => {
      const copyBuildConfigId = Utils.generateUUID(
        opts.xcodeProject.allObjectKeys()
      );
      opts.xcodeProject._defn["objects"][copyBuildConfigId] = {
        isa: "XCBuildConfiguration",
        buildSettings: {
          CLANG_MODULES_AUTOLINK: "YES",
          // without this line, we can't run the tests from the CLI
          DEVELOPMENT_TEAM: "6V5LDB8335",
          LD_RUNPATH_SEARCH_PATHS: [
            "$(inherited)",
            "@executable_path/Frameworks",
            "@loader_path/Frameworks",
          ],
          INFOPLIST_FILE: "ScreenplayUITests/Info.plist",
          CODE_SIGN_STYLE: "Automatic",
          PRODUCT_BUNDLE_IDENTIFIER: "dev.screenplay.ScreenplayUITests",
          ONLY_ACTIVE_ARCH: "false",
          TEST_TARGET_NAME: opts.appTarget.name(),
          TARGETED_DEVICE_FAMILY: "1,2",
          PRODUCT_NAME: "$(TARGET_NAME)",
          OTHER_LDFLAGS: "", // Pilleve (flutter) sets this on a project level - cancel it out for the test target.
          INFOPLIST_PREPROCESS: "NO",
          INFOPLIST_PREFIX_HEADER: "",
        },
        name: buildConfig.name(),
      };

      return copyBuildConfigId;
    });

  const buildConfigList = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][buildConfigList] = {
    isa: "XCConfigurationList",
    defaultConfigurationIsVisible: "0",
    defaultConfigurationName: opts.xcodeProject
      .rootObject()
      .buildConfigurationList()
      .defaultConfigurationName(),
    buildConfigurations: testBuildConfigIds,
  };

  const containerItemProxy = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][containerItemProxy] = {
    isa: "PBXContainerItemProxy",
    containerPortal: opts.xcodeProject.rootObject()._id,
    proxyType: "1",
    remoteGlobalIDString: opts.appTarget._id,
    remoteInfo: opts.appTarget.name(),
  };

  const appTargetDependency = Utils.generateUUID(
    opts.xcodeProject.allObjectKeys()
  );
  opts.xcodeProject._defn["objects"][appTargetDependency] = {
    isa: "PBXTargetDependency",
    target: opts.appTarget._id,
    targetProxy: containerItemProxy,
  };

  const nativeTargetID = Utils.generateUUID(opts.xcodeProject.allObjectKeys());
  opts.xcodeProject._defn["objects"][nativeTargetID] = {
    buildConfigurationList: buildConfigList,
    productReference: xcTestId,
    productType: "com.apple.product-type.bundle.ui-testing",
    productName: "ScreenplayUITests",
    isa: "PBXNativeTarget",
    buildPhases: [sourcesBuildPhaseId],
    dependencies: [appTargetDependency],
    name: "ScreenplayUITests",
    buildRules: [],
  };

  opts.xcodeProject.rootObject()._defn["targets"].push(nativeTargetID);
  if (!opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"]) {
    opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"] = {};
  }
  opts.xcodeProject.rootObject()._defn["attributes"]["TargetAttributes"][
    nativeTargetID
  ] = {
    TestTargetID: opts.appTarget._id,
    CreatedOnToolsVersion: "12.0.1",
  };

  // Add it to the xcscheme
  console.log("Adding tests to scheme");
  XCSchemes.addTests({
    projectPath: opts.projectPath,
    appScheme: opts.appScheme,
    workspacePath: opts.workspacePath,
    nativeTargetID,
    xcodeFileName: opts.xcodeFileName,
    testTargetName: "ScreenplayUITests",
  });
}
