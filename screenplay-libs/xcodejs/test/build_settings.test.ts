import { expect } from "chai";
import { describe } from "mocha";
import BuildSettings from "../src/build_settings";

describe("BuildSettings", function () {
  it("Can extract the correct linkFilePath", () => {
    const buildSettingsPath = "test/resources/build_settings.json";
    const buildSettings = BuildSettings.loadFromFile(buildSettingsPath);
    const baseDir = "abc";
    expect(buildSettings.linkFileListPath(baseDir)).to.eq(
      "abc/Build/Intermediates.noindex/Screenplay-RepCounter.build/Debug-iphonesimulator/Screenplay-Framework-RepCounter.build/Objects-normal/x86_64/Screenplay-Framework-RepCounter.v0.2.3-1462361249717.linkFileList"
    );
    expect(buildSettings.ltoPath(baseDir)).to.eq(
      "abc/Build/Intermediates.noindex/Screenplay-RepCounter.build/Debug-iphonesimulator/Screenplay-Framework-RepCounter.build/Objects-normal/x86_64/Screenplay-Framework-RepCounter.v0.2.3-1462361249717_lto.o"
    );
    expect(buildSettings.linkTarget).to.eq("x86_64-apple-ios13.6-simulator");
  });
});
