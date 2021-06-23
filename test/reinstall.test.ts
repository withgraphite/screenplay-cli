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

describe("reinstall", function () {
  before(() => {
    stubServer();
  });
  this.timeout(60000);
  it("reinstalls correctly on blank app", async () => {
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

    await install({
      "app-target": "blank-objc-storyboard",
      "xcode-project": xcodeprojDir,
      "accept-prompts-for-ci": true,
      "with-tests": false,
      "install-token": undefined,
      "always-enable": false,
      "app-secret": "FAKE_TOKEN",
    });

    const installedProject = PBXProject.readFileSync(xcodeprojProjectDir);

    execSync(
      `yarn cli reinstall "${xcodeprojDir}" --app-target blank-objc-storyboard --accept-prompts-for-ci`,
      {
        stdio: "inherit",
      }
    );
    const reinstalledProject = PBXProject.readFileSync(xcodeprojProjectDir);

    expect(
      JSON.stringify(
        reinstalledProject._defn,
        Object.keys(reinstalledProject._defn).sort(),
        2
      ).replace(/[A-Z0-9]{24}/g, "123")
    ).to.deep.equal(
      JSON.stringify(
        installedProject._defn,
        Object.keys(installedProject._defn).sort(),
        2
      ).replace(/[A-Z0-9]{24}/g, "123")
    );
  });
});
