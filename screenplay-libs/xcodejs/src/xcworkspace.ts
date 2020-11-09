import chalk from "chalk";
import * as fs from "fs-extra";
import path from "path";
import convert from "xml-js";

type FileRef = {
  _attributes: {
    location: string;
  };
};
export class XCWorkspace {
  _defn: convert.ElementCompact;
  _path: string;

  constructor(defn: Record<string, any>, path: string) {
    this._defn = defn;
    this._path = path;
  }

  public allFiles(): string[] {
    return this._defn["Workspace"]["FileRef"].map((fileRef: FileRef) => {
      if (!fileRef._attributes.location.startsWith("group:")) {
        console.log(
          chalk.yellow(
            "Error! Unknown format, XCWorkspace file ref does not start with 'group:'"
          )
        );
      }

      return fileRef._attributes.location.slice(6);
    });
  }

  public updateLocation(oldLocation: string, newLocation: string) {
    this._defn["Workspace"]["FileRef"]
      .filter(
        (fileRef: FileRef) =>
          fileRef._attributes.location === `group:${oldLocation}`
      )
      .map(
        (fileRef: FileRef) =>
          (fileRef._attributes.location = `group:${newLocation}`)
      );
  }

  static fromFile(filePath: string) {
    if (path.basename(filePath) !== "contents.xcworkspacedata") {
      throw new Error(`Cannot load XCWorkspace from filePath ${filePath}`);
    }
    const data = fs.readFileSync(filePath);
    const defn: any = convert.xml2js(data.toString(), { compact: true });

    return new XCWorkspace(defn, filePath);
  }

  public save() {
    fs.writeFileSync(this._path, convert.js2xml(this._defn, { compact: true }));
  }
}
