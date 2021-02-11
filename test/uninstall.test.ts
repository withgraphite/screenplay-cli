import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import { describe } from "mocha";
import path from "path";
import tmp from "tmp";
import { PBXProject } from "xcodejs";

describe("uninstall_clears_install", function () {
  it("uninstalls correctly on blank app", (done) => {
    const appDir = tmp.dirSync({ keep: false });
    fs.copySync(
      path.join(__dirname, "resources/blank-objc-storyboard"),
      appDir.name
    );
    const xcodeprojDir = path.join(
      appDir.name,
      "blank-objc-storyboard.xcodeproj"
    );
    const xcodeprojProjectDir = path.join(xcodeprojDir, "project.pbxproj");

    const preinstallProject = PBXProject.readFileSync(xcodeprojProjectDir);

    execSync(
      `yarn --cwd .. cli install --appToken FAKE_TOKEN --xcode-project "${xcodeprojDir}"`,
      { stdio: "inherit" }
    );
    execSync(`yarn --cwd .. cli uninstall "${xcodeprojDir}"`, {
      stdio: "inherit",
    });

    const postinstallProject = PBXProject.readFileSync(xcodeprojProjectDir);

    expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);

    fs.emptyDirSync(appDir.name);
    appDir.removeCallback();
    done();
  }).timeout(10000);

  it("uninstalls correctly on lover", (done) => {
    const appDir = tmp.dirSync({ keep: false });
    fs.copySync(path.join(__dirname, "resources/lover"), appDir.name);

    execSync(
      `yarn --cwd .. cli uninstall "${path.join(
        appDir.name,
        "installed/lover-iphone.xcodeproj"
      )}"`,
      {
        stdio: "inherit",
      }
    );
    const preInstallProject = PBXProject.readFileSync(
      path.join(appDir.name, "original/lover-iphone.xcodeproj/project.pbxproj")
    );
    const postInstallProject = PBXProject.readFileSync(
      path.join(appDir.name, "installed/lover-iphone.xcodeproj/project.pbxproj")
    );
    expect(postInstallProject._defn).to.deep.equal(preInstallProject._defn);

    fs.emptyDirSync(appDir.name);
    appDir.removeCallback();
    done();
  }).timeout(10000);
});
