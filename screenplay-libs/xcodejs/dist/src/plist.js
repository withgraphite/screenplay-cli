"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plist = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
// Note: DO NOT ASSUME this is an info.plist (it could also be entitlements)
// If you need to add info.plist specific methods here, please subclass this
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
    // This is ignoring plist modifiers for now...
    static _renderWithValues(node, values) {
        if (typeof node === "string") {
            return values.expand(node);
        }
        else if (Array.isArray(node)) {
            return node.map((v) => {
                return this._renderWithValues(v, values);
            });
        }
        else if (node instanceof Object) {
            const ret = {};
            Object.keys(node).forEach((key) => {
                ret[key] = this._renderWithValues(node[key], values);
            });
            return ret;
        }
        return node;
    }
    renderWithValues(values) {
        return new Plist(Plist._renderWithValues(this._defn, values));
    }
    static mergeKeyFromOthers(key, values, overrideList) {
        // If override value, take the newest value.
        if (overrideList.includes(key)) {
            const newestVal = values[0]; // Risky ordering assumption
            return newestVal;
        }
        // No specific handler found, assuming they must all be identical
        const firstValue = values[0];
        const firstValueJSON = JSON.stringify(firstValue);
        if (!values.every((value) => {
            // This isn't entirely correct, JSON doesn't guarantee ordering of dictionary keys, but
            // works for now
            return JSON.stringify(value) === firstValueJSON;
        })) {
            const errorMessage = "Different values detected for key '" +
                key +
                "'(" +
                values
                    .map((v) => {
                    return `${JSON.stringify(v, null, 2)}`;
                })
                    .join(", ") +
                `), this key cannot be different. Consider accepting the newer value by adding ${key} to the "SCREENPLAY_PLIST_CONFLICT_ALLOWLIST" build settings.`;
            console.error(chalk_1.default.red(errorMessage));
            throw new Error(errorMessage);
        }
        return firstValue;
    }
    static fromOthers(plists, overrideList) {
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
            }), overrideList);
        });
        return new Plist(mergedDefn);
    }
    writeFile(file) {
        child_process_1.execSync(`plutil -convert xml1 - -o "${file}"`, {
            input: JSON.stringify(this._defn),
        });
    }
}
exports.Plist = Plist;
//# sourceMappingURL=plist.js.map