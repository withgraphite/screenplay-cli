import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import tmp from "tmp";
import { PBXProject } from "xcodejs";

describe("uninstall_clears_install", function () {
  this.timeout(60000);
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

    // Because the install script prompts the user to enter their app name, we need to
    // pipe in a return to pass this.
    execSync(
      `echo '\n' | yarn cli install --install-token FAKE_TOKEN --xcode-project "${xcodeprojDir}"`,
      { stdio: "inherit" }
    );
    execSync(`yarn cli uninstall "${xcodeprojDir}"`, {
      stdio: "inherit",
    });

    const postinstallProject = PBXProject.readFileSync(xcodeprojProjectDir);

    expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);

    fs.emptyDirSync(appDir.name);
    appDir.removeCallback();
    done();
  });
});
