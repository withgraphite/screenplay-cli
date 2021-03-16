import { expect } from "chai";
import { execSync } from "child_process";
import fs from "fs-extra";
import { describe } from "mocha";
import path from "path";
import tmp from "tmp";
import { PBXProject } from "xcodejs";

describe("reinstall", function () {
  it("reinstalls correctly on blank app", (done) => {
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

    execSync(
      `yarn --cwd .. cli install --appToken FAKE_TOKEN --xcode-project "${xcodeprojDir}"`,
      { stdio: "inherit" }
    );

    const installedProject = PBXProject.readFileSync(xcodeprojProjectDir);

    execSync(`yarn --cwd .. cli reinstall "${xcodeprojDir}"`, {
      stdio: "inherit",
    });
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
    done();
  }).timeout(20000);
});
