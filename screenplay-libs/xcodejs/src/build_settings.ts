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

  public objectFilesDir(buildDir: string): string {
    const objectFileDir = this._defn["OBJECT_FILE_DIR_normal"];
    if (!objectFileDir) {
      throw new Error(`buildSettings must include OBJECT_FILE_DIR_normal`);
    }
    const objectFileDirPathMatchs = objectFileDir.match(/Intermediates.*/);
    if (!objectFileDirPathMatchs) {
      throw new Error(
        `unable to extract path from OBJECT_FILE_DIR_normal = ${objectFileDir}`
      );
    }
    const arch = this._defn["arch"];
    if (!objectFileDir) {
      throw new Error(`buildSettings must include "arch"`);
    }
    return path.join(buildDir, objectFileDirPathMatchs[0], arch);
  }

  public linkFileListPath(buildDir: string): string {
    const linkFileName = `${this._defn["EXECUTABLE_NAME"]}.linkFileList`;
    return path.join(this.objectFilesDir(buildDir), linkFileName);
  }

  public ltoPath(buildDir: string): string {
    const linkFileName = `${this._defn["EXECUTABLE_NAME"]}_lto.o`;
    return path.join(this.objectFilesDir(buildDir), linkFileName);
  }

  public swiftModulePath(buildDir: string): string {
    const linkFileName = `${this._defn["EXECUTABLE_NAME"]}.swiftmodule`;
    return path.join(this.objectFilesDir(buildDir), linkFileName);
  }

  public dependencyInfoDat(buildDir: string): string {
    const linkFileName = `${this._defn["EXECUTABLE_NAME"]}_dependency_info.dat`;
    return path.join(this.objectFilesDir(buildDir), linkFileName);
  }

  public get installName(): string {
    return `@rpath/${this._defn["CONTENTS_FOLDER_PATH"]}/${this.executableName}`;
  }

  public tempDir(buildDir: string): string {
    return path.join(
      buildDir,
      this._defn["TEMP_DIR"].match(/Intermediates\.noindex.*/)![0]
    );
  }

  public get executableName(): string {
    return this._defn["EXECUTABLE_NAME"];
  }

  public get productModuleName(): string {
    return this._defn["PRODUCT_MODULE_NAME"];
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
    return this._defn["EXECUTABLE_PATH"];
  }

  public get sdkRoot(): string {
    return this._defn["SDKROOT"];
  }

  public get correspondingDeviceSDKDir(): string {
    return this._defn["CORRESPONDING_DEVICE_SDK_DIR"];
  }

  public get librarySearchPaths(): string {
    return this._defn["LIBRARY_SEARCH_PATHS"];
  }

  public get testLibrarySearchPaths(): string {
    return this._defn["TEST_LIBRARY_SEARCH_PATHS"];
  }

  public get frameworkSearchPaths(): string {
    return this._defn["FRAMEWORK_SEARCH_PATHS"];
  }

  public get testFrameworkSearchPaths(): string {
    return this._defn["TEST_FRAMEWORK_SEARCH_PATHS"];
  }

  public get ldRunpathSearchPaths(): string {
    return this._defn["LD_RUNPATH_SEARCH_PATHS"];
  }

  public get linkTarget(): string {
    return `${this._defn["NATIVE_ARCH"]}-${this._defn["LLVM_TARGET_TRIPLE_VENDOR"]}-${this._defn["LLVM_TARGET_TRIPLE_OS_VERSION"]}${this._defn["LLVM_TARGET_TRIPLE_SUFFIX"]}`;
  }

  public get marketingVersion(): string {
    return this._defn["MARKETING_VERSION"];
  }

  public get astPath(): string {
    return `${this._defn["NATIVE_ARCH"]}-${this._defn["LLVM_TARGET_TRIPLE_VENDOR"]}-${this._defn["LLVM_TARGET_TRIPLE_OS_VERSION"]}${this._defn["LLVM_TARGET_TRIPLE_SUFFIX"]}`;
  }

  public get targetName(): string {
    return this._defn["TARGET_NAME"];
  }

  public get unlocalizedResourcesFolderPath(): string {
    return this._defn["UNLOCALIZED_RESOURCES_FOLDER_PATH"];
  }

  public targetBuildDir(buildDir: string): string {
    return path.join(
      buildDir,
      this._defn["TARGET_BUILD_DIR"].match(/Products\/.*/)[0]
    );
  }

  public frameworkPath(buildDir: string): string {
    return path.join(
      this.targetBuildDir(buildDir),
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
