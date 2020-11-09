"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XCSettings = void 0;
const child_process_1 = require("child_process");
class XCSettings {
    constructor(defn) {
        this._defn = defn;
    }
    static fromFile(file) {
        const data = child_process_1.execSync("plutil -convert json -o - " + file, {
            maxBuffer: 1024 * 1024 * 1024,
        });
        const defn = JSON.parse(data.toString());
        return new XCSettings(defn);
    }
}
exports.XCSettings = XCSettings;
//# sourceMappingURL=xcsettings.js.map