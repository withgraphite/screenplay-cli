import chalk from "chalk";
import { execSync } from "child_process";
import BuildSettings from "./build_settings";

type TPlist = string | TPlist[] | { [key: string]: TPlist };

// Note: DO NOT ASSUME this is an info.plist (it could also be entitlements)
// If you need to add info.plist specific methods here, please subclass this
export class Plist {
  _defn: { [key: string]: any };

  constructor(defn: {}) {
    this._defn = defn;
  }

  static fromFile(file: string): Plist {
    const data = execSync(`plutil -convert json -o - "${file}"`);
    const defn = JSON.parse(data.toString());

    return new Plist(defn);
  }

  public get(key: string): any {
    return this._defn[key];
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
    return new Plist(Plist._renderWithValues(this._defn, values));
  }

  static mergeKeyFromOthers(
    key: string,
    values: any[],
    overrideList: string[]
  ) {
    // If override value, take the newest value.
    console.log(`Override list = ${overrideList}`);
    if (overrideList.includes(key)) {
      const newestVal = values[0];
      console.log(
        chalk.yellow(
          `warning: Merging plist value conflict ${key} with lastest value ${newestVal}`
        )
      );
      return newestVal;
    }
    // No specific handler found, assuming they must all be identical
    const firstValue = values[0];
    const firstValueJSON = JSON.stringify(firstValue);
    if (
      !values.every((value) => {
        // This isn't entirely correct, JSON doesn't guarantee ordering of dictionary keys, but
        // works for now
        return JSON.stringify(value) === firstValueJSON;
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
    console.log("Writing plist", this._defn);

    execSync(`plutil -convert xml1 - -o "${file}"`, {
      input: JSON.stringify(this._defn),
    });
  }
}
