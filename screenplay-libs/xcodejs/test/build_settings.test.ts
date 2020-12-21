import { expect } from "chai";
import { describe } from "mocha";
import BuildSettings from "../src/build_settings";

describe("BuildSettings", function () {
  it("Can extract the correct linkFilePath", () => {
    const buildSettingsPath = "test/resources/build_settings.json";
    const buildSettings = BuildSettings.loadFromFile(buildSettingsPath);
    expect(buildSettings.objectFilesDir.match(/monologue.+/)![0]).to.eq(
      "monologue/build-phase/cache/Build/Intermediates.noindex/Screenplay-RepCounter.build/Debug-iphonesimulator/Screenplay-Framework-RepCounter.build/Objects-normal/x86_64"
    );
    expect(buildSettings.fatFrameworkPath.match(/monologue.+/)![0]).to.eq(
      "monologue/build-phase/cache/Build/Products/Debug-iphonesimulator/Screenplay-Framework-RepCounter.v0.2.3-1462361249717.framework"
    );
    expect(buildSettings.linkTarget).to.eq("x86_64-apple-ios13.6-simulator");
  });
});
