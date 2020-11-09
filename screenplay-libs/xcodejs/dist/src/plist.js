"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plist = void 0;
const child_process_1 = require("child_process");
class Plist {
    constructor(defn) {
        this._defn = defn;
    }
    static fromFile(file) {
        const data = child_process_1.execSync(`plutil -convert json -o - "${file}"`);
        const defn = JSON.parse(data.toString());
        return new Plist(defn);
    }
    get(key) {
        return this._defn[key];
    }
    static mergeKeyFromOthers(key, values) {
        // Add specific key handlers here
        // No specific handler found, assuming they must all be identical
        const firstValue = values[0];
        const firstValueJSON = JSON.stringify(firstValue);
        if (!values.every((value) => {
            // This isn't entirely correct, JSON doesn't guarantee ordering of dictionary keys, but
            // works for now
            return JSON.stringify(value) === firstValueJSON;
        })) {
            throw ("Different values detected for key '" +
                key +
                "', this key cannot be different");
        }
        return values[0];
    }
    static fromOthers(plists) {
        const allKeys = new Set();
        plists.forEach((plist) => {
            Object.keys(plist._defn).forEach((k) => {
                allKeys.add(k);
            });
        });
        const mergedDefn = {};
        allKeys.forEach((key) => {
            mergedDefn[key] = Plist.mergeKeyFromOthers(key, plists
                .map((plist) => {
                return plist._defn[key];
            })
                .filter((v) => {
                return v !== undefined;
            }));
        });
        return new Plist(mergedDefn);
    }
    writeFile(file) {
        child_process_1.execSync("plutil -convert xml1 - -o " + file, {
            input: JSON.stringify(this._defn),
        });
    }
}
exports.Plist = Plist;
//# sourceMappingURL=plist.js.map