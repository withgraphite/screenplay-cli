import PBXBuildFile from "./pbx_build_file";
import PBXObject from "./pbx_object";

export default class PBXBuildPhase extends PBXObject {
  inputPaths(): string[] {
    return this._defn["inputPaths"];
  }

  addFile(file: PBXBuildFile) {
    if (this.isa() != "PBXResourcesBuildPhase") {
      throw new Error(`Cant add files to buildPhase of type ${this.isa()}`);
    }
    if (!this._defn["files"]) {
      this._defn["files"] = [file._id];
    } else if (this._defn["files"] instanceof Array) {
      this._defn["files"].push(file._id);
    } else {
      throw new Error(
        `Could not add file to buildPhase file list of type ${typeof this._defn[
          "files"
        ]}`
      );
    }
  }

  setInputPaths(inputPaths: string[]) {
    this._defn["inputPaths"] = inputPaths;
  }

  shellScript(): string {
    return this._defn["shellScript"];
  }

  setShellScript(shellScript: string) {
    this._defn["shellScript"] = shellScript;
  }
}
