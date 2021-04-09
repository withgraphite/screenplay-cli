import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import BuildSettings from "./build_settings";

type TPlist = string | TPlist[] | { [key: string]: TPlist };

// Note: DO NOT ASSUME this is an info.plist (it could also be entitlements)
// If you need to add info.plist specific methods here, please subclass this
export class Plist {
  _defn: { [key: string]: TPlist };

  constructor(defn: { [key: string]: TPlist }) {
    this._defn = defn;
  }

  static fromFile(file: string): Plist {
    const data = execSync(`plutil -convert json -o - "${file}"`);
    const defn = JSON.parse(data.toString());

    return new Plist(defn);
  }

  static fromString(str: string): Plist {
    const data = execSync(`plutil -convert json -o - -- -`, { input: str });
    const defn = JSON.parse(data.toString());

    return new Plist(defn);
  }

  public get(key: string): any {
    return this._defn[key];
  }

  public dig(...keys: string[]): any {
    let cur: any = this._defn;
    for (const key in keys) {
      if (cur[key]) {
        cur = cur[key];
      } else {
        return undefined;
      }
    }
    return cur;
  }

  // This is ignoring plist modifiers for now...
  private static _renderWithValues(
    node: TPlist,
    values: BuildSettings
  ): TPlist {
    if (typeof node === "string") {
      return values.expand(node);
    } else if (Array.isArray(node)) {
      return node.map((v) => {
        return this._renderWithValues(v, values);
      });
    } else if (node instanceof Object) {
      const ret: Record<string, TPlist> = {};
      Object.keys(node).forEach((key) => {
        ret[key] = this._renderWithValues(node[key], values);
      });

      return ret;
    }

    return node;
  }

  public renderWithValues(values: BuildSettings): Plist {
    return new Plist(
      Plist._renderWithValues(this._defn, values) as { [key: string]: TPlist }
    );
  }

  static mergeKeyFromOthers(
    key: string,
    values: any[],
    overrideList: string[]
  ) {
    // If override value, take the newest value.
    if (overrideList.includes(key)) {
      const newestVal = values[0]; // Risky ordering assumption
      return newestVal;
    }
    // No specific handler found, assuming they must all be identical
    const firstValue = values[0];
    const firstValueJSON = JSON.stringify(
      firstValue,
      Object.keys(firstValue).sort()
    );
    if (
      !values.every((value) => {
        // This isn't entirely correct, JSON doesn't guarantee ordering of dictionary keys, but
        // works for now
        return (
          JSON.stringify(value, Object.keys(value).sort()) === firstValueJSON
        );
      })
    ) {
      const errorMessage =
        "Different values detected for key '" +
        key +
        "'(" +
        values
          .map((v) => {
            return `${JSON.stringify(v, null, 2)}`;
          })
          .join(", ") +
        `), this key cannot be different. Consider accepting the newer value by adding ${key} to the "SCREENPLAY_PLIST_CONFLICT_ALLOWLIST" build settings.`;
      console.error(chalk.red(errorMessage));
      throw new Error(errorMessage);
    }
    return firstValue;
  }

  static fromOthers(plists: Plist[], overrideList: string[]) {
    const allKeys = new Set<string>();
    plists.forEach((plist) => {
      Object.keys(plist._defn).forEach((k) => {
        allKeys.add(k);
      });
    });

    const mergedDefn: { [key: string]: any } = {};
    allKeys.forEach((key) => {
      mergedDefn[key] = Plist.mergeKeyFromOthers(
        key,
        plists
          .map((plist) => {
            return plist._defn[key];
          })
          .filter((v) => {
            return v !== undefined;
          }),
        overrideList
      );
    });

    return new Plist(mergedDefn);
  }

  public writeFile(file: string) {
    /**
     * Note: Our plutil shim on linux can't take input from stdin.
     */
    const tempFile = tmp.fileSync();
    fs.writeFileSync(tempFile.name, JSON.stringify(this._defn));
    execSync(`plutil -convert xml1 "${tempFile.name}" -o "${file}"`);
    tempFile.removeCallback();
  }
}
