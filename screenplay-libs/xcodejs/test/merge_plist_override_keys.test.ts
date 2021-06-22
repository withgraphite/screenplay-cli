import { expect } from "chai";
import { describe } from "mocha";
import { Plist } from "../src/plist";

describe("merge_sample_plists", function () {
  it("Takes latest bundle value", () => {
    expect(Plist.mergeOverrideKey("TakeLatestBundleValue", [0])).to.eql(0);
    expect(Plist.mergeOverrideKey("TakeLatestBundleValue", [0, 1, 2])).to.eql(
      0
    );
  });

  it("Takes latest non-null bundle value", () => {
    expect(
      Plist.mergeOverrideKey("TakeLatestNonNullOrUndefinedBundleValue", [
        null,
        0,
        1,
      ])
    ).to.eql(0);
    expect(
      Plist.mergeOverrideKey("TakeLatestNonNullOrUndefinedBundleValue", [
        undefined,
        0,
        1,
      ])
    ).to.eql(0);
    expect(
      Plist.mergeOverrideKey("TakeLatestNonNullOrUndefinedBundleValue", [null])
    ).to.be.null;
    expect(
      Plist.mergeOverrideKey("TakeLatestNonNullOrUndefinedBundleValue", [
        undefined,
      ])
    ).to.be.null;
    expect(
      Plist.mergeOverrideKey("TakeLatestNonNullOrUndefinedBundleValue", [0, 1])
    ).to.eql(0);
  });

  it("Takes bundle value with greatest semantic version", () => {
    expect(Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.3"])).to.eql(
      "14.3"
    );
    expect(
      Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.0", "14.3"])
    ).to.eql("14.3");
    expect(
      Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.3", "14.0"])
    ).to.eql("14.3");
  });
});
