import { expect } from "chai";
import { execSync } from "child_process";
import path from "path";
import { PBXNativeTarget, PBXProject } from "xcodejs";
import {
  extractTarget,
  getAppIcon,
  inferProductName,
  readProject,
} from "../../src/lib/utils";

describe("Can infer revelant information from an app", function () {
  let unzippedPath: string,
    xcodeProjectPath: string,
    xcodeProject: PBXProject,
    target: PBXNativeTarget;

  before(function () {
    const zipPath = path.join(__dirname, "../resources/DuckDuckGo.zip");
    unzippedPath = path.join(__dirname, "../resources/temp");

    execSync(`unzip ${zipPath} -d ${unzippedPath} > /dev/null`, {
      stdio: "inherit",
    });

    xcodeProjectPath = `${unzippedPath}/DuckDuckGo/default/DuckDuckGo.xcodeproj`;
    xcodeProject = readProject(xcodeProjectPath);

    const targetName = "DuckDuckGo";
    target = extractTarget(xcodeProject, targetName);
  });

  it("correctly infers the app name from the xcodeproj", function () {
    expect(inferProductName(xcodeProject, target)).to.eq("DuckDuckGo");
  });

  it("correctly infers the app icon from the xcodeproj", function () {
    expect(getAppIcon(xcodeProject, target)).to.eq(
      `${unzippedPath}/DuckDuckGo/default/DuckDuckGo/Assets.xcassets/AppIcon.appiconset/1024pt.png`
    );
  });

  after(function () {
    execSync(`rm -rf ${unzippedPath} > /dev/null`, {
      stdio: "inherit",
    });
  });
});
