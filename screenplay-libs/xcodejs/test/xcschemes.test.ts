import { expect } from "chai";
import * as fs from "fs-extra";
import { describe } from "mocha";
import * as path from "path";
import { PBXNativeTarget, PBXProject } from "../index";
import { addTests, createSchema } from "../src/xcschemes";

describe("xcschemes", function () {
  before(() => {
    if (!fs.existsSync("test-output")) {
      fs.mkdirSync("test-output");
    }
    fs.emptyDirSync("test-output");
    fs.copySync(
      "test/resources/Client.xcodeproj",
      "test-output/Client.xcodeproj"
    );
  });

  it("Can correctly process an xcscheme", () => {
    const projectPath = "test-output/Client.xcodeproj";
    const xcodeProject = PBXProject.readFileSync(
      path.join(projectPath, "project.pbxproj")
    );
    const appTarget: PBXNativeTarget = xcodeProject
      .appTargets()
      .find((t) => t.name() === "Client")!;
    const newTargetId = xcodeProject.deepDuplicate(appTarget._id);
    const newTarget = new PBXNativeTarget(newTargetId, xcodeProject);
    newTarget.set("name", "Screenplay-Client");
    expect(
      fs.existsSync(
        "test-output/Client.xcodeproj/xcshareddata/xcschemes/Screenplay-Fennec.xcscheme"
      )
    ).to.be.false;
    createSchema({
      projectPath,
      srcSchemeName: "Fennec",
      srcAppTarget: appTarget,
      newBuildTarget: newTarget,
      buildableNameExtension: "app",
    });
    addTests({
      projectPath,
      appScheme: "Screenplay-Fennec",
      nativeTargetID: newTargetId,
      xcodeFileName: path.basename(projectPath),
    });
    const newScheme = fs
      .readFileSync(
        "test-output/Client.xcodeproj/xcshareddata/xcschemes/Screenplay-Fennec.xcscheme"
      )
      .toString();
    expect(newScheme).not.to.include("</0>");
    expect(newScheme).to.include("Screenplay-Client");
    expect(newScheme).to.include("ScreenplayUITests");
  });
});
