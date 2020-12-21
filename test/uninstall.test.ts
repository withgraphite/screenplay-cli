import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import { describe } from "mocha";
import path from "path";
import tmp from "tmp";
import { PBXProject } from "xcodejs";

describe("uninstall_clears_install", function () {
  it("uninstall_clears_install", (done) => {
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

    process.chdir(path.join(__dirname, ".."));
    execSync(
      `yarn cli install --appToken FAKE_TOKEN --xcode-project "${xcodeprojDir}"`,
      { stdio: "inherit" }
    );
    execSync(`yarn cli uninstall "${xcodeprojDir}"`, { stdio: "inherit" });

    const postinstallProject = PBXProject.readFileSync(xcodeprojProjectDir);

    expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);
    done();
  }).timeout(10000);
});
