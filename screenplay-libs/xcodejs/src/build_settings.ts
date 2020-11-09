import chalk from "chalk";
import { execSync } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";

export default class BuildSettings {
  _defn: Record<string, any>;

  constructor(defn: {}) {
    this._defn = defn;
  }

  public static loadFromFile(filePath: string): BuildSettings {
    return new BuildSettings(JSON.parse(fs.readFileSync(filePath).toString()));
  }

  public static loadFromProject(
    project: string,
    target: string,
    options: {
      // TODO: Handle things like SDK, Architecture, Etc.
    }
  ): BuildSettings {
    return getBuildSettingsAndTargetNameFromTarget(project, target, options)[0];
  }

  public writeToFile(filePath: string) {
    fs.writeFileSync(filePath, JSON.stringify(this._defn, null, 2));
  }

  public get(key: string): any {
    return this._defn[key];
  }

  private applyOperation(operation: string, value: string): string {
    /*
     * TODO: At some point we should implement all the various build phase
     * operations (best documented here: https://github.com/facebook/xcbuild/blob/4b96d137af8b8397b9cc6cd341e3aed51833365f/Libraries/pbxsetting/Sources/Environment.cpp#L34-L113)
     * However, bitrise seems to not and it's fine: https://github.com/bitrise-io/xcode-project/blob/09e5737e052d9d01cb927e53e18c378868377414/xcodeproj/xcodeproj.go#L222
     */

    return value;
  }

  public expand(value: string): string {
    return value.replace(
      /\$(\(([^)]+)\)|\{([^}]+)\})/g,
      (match, _, parenSetting, bracketSetting) => {
        const setting = parenSetting || bracketSetting;
        const tokens = setting.split(":");
        let value = this.get(tokens.shift());
        for (let token of tokens) {
          value = this.applyOperation(token, value);
        }

        return value;
      }
    );
  }

  public buildProductsDir(baseDir: string) {
    const buildProductsDir = this._defn["BUILT_PRODUCTS_DIR"];
    if (!buildProductsDir) {
      throw new Error(`buildSettings must include BUILT_PRODUCTS_DIR`);
    }
    const productsPathMatches = buildProductsDir.match(/Build\/Products\/.*/);
    if (!productsPathMatches) {
      throw new Error(
        `unable to extract path from BUILT_PRODUCTS_DIR = ${buildProductsDir}`
      );
    }
    return path.join(baseDir, productsPathMatches[0]);
  }

  public getFrameworkPath(buildPath: string): string {
    return path.join(
      this.buildProductsDir(buildPath),
      this._defn["CONTENTS_FOLDER_PATH"]
    );
  }
}

export function getBuildSettingsAndTargetNameFromTarget(
  project: string,
  target: string,
  options: {
    // TODO: Handle things like SDK, Architecture, Etc.
  }
) {
  const buildSettingsArray = JSON.parse(
    execSync(
      `xcodebuild -showBuildSettings -json -project "${project}" -target "${target}"`
    )
      .toString()
      .trim()
  );

  if (buildSettingsArray.length !== 1) {
    console.log(chalk.yellow("Warning! Target has more than one match"));
    process.exit(1);
  }

  return [
    new BuildSettings(buildSettingsArray[0]["buildSettings"]),
    buildSettingsArray[0]["target"] as string,
  ] as const;
}
