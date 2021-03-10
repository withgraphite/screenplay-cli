import chalk from "chalk";
import { execSync } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";

export default class BuildSettings {
  _defn: Record<string, string>;

  constructor(defn: Record<string, string>) {
    if (!defn["TARGET_BUILD_DIR"]) {
      throw new Error(
        `Build settings missing value for TARGET_BUILD_DIR, xcodebuild call likely failed before completing`
      );
    }
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

  public get(key: string): string | undefined {
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
        let value = this.fetchOrUndefined(tokens.shift()) || "";
        for (const token of tokens) {
          value = this.applyOperation(token, value);
        }

        return value;
      }
    );
  }

  public fetch(key: string): string {
    const value = this._defn[key];
    if (!value) {
      throw new Error(`No value for "${key}" found in build settings`);
    }
    return value;
  }

  public fetchOrUndefined(key: string): string | undefined {
    return this._defn[key];
  }

  public get objectFilesDir(): string {
    return this.fetch("OBJECT_FILE_DIR_normal");
  }

  public get installName(): string {
    return `@rpath/${this.fetch("CONTENTS_FOLDER_PATH")}/${
      this.executableName
    }`;
  }

  public get tempDir(): string {
    return this.fetch("TEMP_DIR");
  }

  public get infoplistFile(): string {
    return this.fetch("INFOPLIST_FILE");
  }

  public get entitlementsFile(): string | undefined {
    return this.fetchOrUndefined("CODE_SIGN_ENTITLEMENTS");
  }

  public get srcRoot(): string {
    return this.fetch("SRCROOT");
  }

  public get executableName(): string {
    return this.fetch("EXECUTABLE_NAME");
  }

  public get configuration(): string {
    return this.fetch("CONFIGURATION");
  }

  public get screenplaySemVer(): string {
    return this.fetch("SCREENPLAY_SEMVER");
  }

  public get productModuleName(): string {
    return this.fetch("PRODUCT_MODULE_NAME");
  }

  public get unversionedProductModuleName(): string {
    try {
      return this.productModuleName.match(/(.*)_v(\d|undefined)/)![1];
    } catch (err) {
      console.error(
        `Failed to extract unversioned product module from ${this.productModuleName}`
      );
      throw err;
    }
  }

  public get executablePath(): string {
    return this.fetch("EXECUTABLE_PATH");
  }

  public get archs(): string {
    return this.fetch("ARCHS");
  }

  public get sdkRoot(): string {
    return this.fetch("SDKROOT");
  }

  public get sdkVersion(): string {
    return this.fetch("SDK_VERSION");
  }

  public get correspondingDeviceSDKDir(): string {
    return this.fetch("CORRESPONDING_DEVICE_SDK_DIR");
  }

  public get librarySearchPaths(): string {
    return this.fetch("LIBRARY_SEARCH_PATHS");
  }

  public get testLibrarySearchPaths(): string {
    return this.fetch("TEST_LIBRARY_SEARCH_PATHS");
  }

  public get frameworkSearchPaths(): string {
    return this.fetch("FRAMEWORK_SEARCH_PATHS");
  }

  public get testFrameworkSearchPaths(): string {
    return this.fetch("TEST_FRAMEWORK_SEARCH_PATHS");
  }

  public get ldRunpathSearchPaths(): string {
    return this.fetch("LD_RUNPATH_SEARCH_PATHS");
  }

  public get linkTarget(): string {
    return `${this.fetch("NATIVE_ARCH")}-${this.fetch(
      "LLVM_TARGET_TRIPLE_VENDOR"
    )}-${this.fetch("LLVM_TARGET_TRIPLE_OS_VERSION")}${
      this.fetch("LLVM_TARGET_TRIPLE_SUFFIX") || "" // Builds targeting "any" have no suffix, simulator builds for example do.
    }`;
  }

  public get marketingVersion(): string {
    return this.fetch("MARKETING_VERSION");
  }

  public get astPath(): string {
    return `${this.fetch("NATIVE_ARCH")}-${this.fetch(
      "LLVM_TARGET_TRIPLE_VENDOR"
    )}-${this.fetch("LLVM_TARGET_TRIPLE_OS_VERSION")}${this.fetch(
      "LLVM_TARGET_TRIPLE_SUFFIX"
    )}`;
  }

  public get targetName(): string {
    return this.fetch("TARGET_NAME");
  }

  public get unlocalizedResourcesFolderPath(): string {
    return this.fetch("UNLOCALIZED_RESOURCES_FOLDER_PATH");
  }

  public get targetBuildDir(): string {
    return this.fetch("TARGET_BUILD_DIR");
  }

  public get fatFrameworkPath(): string {
    return path.join(this.targetBuildDir, this.fetch("EXECUTABLE_PATH"));
  }

  public get fatFrameworkDirPath(): string {
    return path.join(this.targetBuildDir, this.fetch("EXECUTABLE_FOLDER_PATH"));
  }

  public get executableFolderPath(): string {
    return this.fetch("EXECUTABLE_FOLDER_PATH");
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
    (buildSettingsArray[0]["target"] as string).replace(/(^")|("$)/g, ""),
  ] as const;
}
