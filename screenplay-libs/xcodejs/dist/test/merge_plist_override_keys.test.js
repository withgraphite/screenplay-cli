"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const plist_1 = require("../src/plist");
mocha_1.describe("merge_sample_plists", function () {
    it("Takes latest bundle value", () => {
        chai_1.expect(plist_1.Plist.mergeOverrideKey("TakeLatestBundleValue", [0])).to.eql(0);
        chai_1.expect(plist_1.Plist.mergeOverrideKey("TakeLatestBundleValue", [0, 1, 2])).to.eql(0);
    });
    it("Takes bundle value with greatest semantic version", () => {
        chai_1.expect(plist_1.Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.3"])).to.eql("14.3");
        chai_1.expect(plist_1.Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.0", "14.3"])).to.eql("14.3");
        chai_1.expect(plist_1.Plist.mergeOverrideKey("TakeGreatestSemverValue", ["14.3", "14.0"])).to.eql("14.3");
    });
});
//# sourceMappingURL=merge_plist_override_keys.test.js.map