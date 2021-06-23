import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import nock from "nock";
import path from "path";
import tmp from "tmp";
import { PBXProject } from "xcodejs";
import { install } from "../src/commands/install";

function stubServer() {
  nock(/.*api.screenplay.dev.*/)
    .post("/v1/new-app/FAKE_TOKEN")
    .reply(200, {
      id: "123",
      appSecret: "test_release_secret",
    });
}

describe("uninstall_clears_install", function () {
  before(() => {
    stubServer();
  });

  this.timeout(60000);
  it("uninstalls correctly on blank app", async () => {
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

    await install({
      "app-target": "blank-objc-storyboard",
      "xcode-project": xcodeprojDir,
      "accept-prompts-for-ci": true,
      "with-tests": false,
      "install-token": undefined,
      "always-enable": false,
      "app-secret": "FAKE_TOKEN",
    });

    execSync(`yarn cli uninstall "${xcodeprojDir}"`, {
      stdio: "inherit",
    });

    const postinstallProject = PBXProject.readFileSync(xcodeprojProjectDir);

    expect(postinstallProject._defn).to.deep.equal(preinstallProject._defn);

    fs.emptyDirSync(appDir.name);
    appDir.removeCallback();
  });
});
