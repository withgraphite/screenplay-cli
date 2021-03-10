import path from "path";
import PBXGroup from "./pbx_group";
import PBXObject from "./pbx_object";
import PBXProj from "./pbx_project";
import { generateUUID } from "./utils";

function findParents(id: string, group: PBXGroup): PBXGroup[] | null {
  for (const child of group.children()) {
    if (child._id === id) {
      return [group];
    } else if (
      ["PBXGroup", "XCVersionGroup", "PBXVariantGroup"].includes(child.isa())
    ) {
      const foundPath = findParents(id, new PBXGroup(child._id, child._proj));
      if (foundPath !== null) {
        return [group].concat(foundPath);
      }
    }
  }

  return null;
}

// 41EFD79B24E82A3800CFD822 /* NextcloudOld.framework */ = {
//   isa = PBXFileReference;
//   lastKnownFileType = wrapper.framework;
//   name = NextcloudOld.framework;
//   path = "../../../../Users/gregfoster/monologue/test-data/frameworks/test-frameworks/NextcloudOld.framework";
//   sourceTree = "<group>";
// };

type PBXFileReferenceData = {
  isa: string;
  lastKnownFileType: string;
  name: string;
  path: string;
  sourceTree: string;
};

const DEFAULTS = {
  isa: "PBXFileReference",
  lastKnownFileType: "wrapper.framework",
  sourceTree: "<group>",
};

export default class PBXFileReference extends PBXObject {
  constructor(
    id: string,
    proj: PBXProj,
    data: PBXFileReferenceData | null = null
  ) {
    super(id, proj, data);
  }

  static createFromFrameworkPath(
    frameworkPath: string,
    proj: PBXProj
  ): PBXFileReference {
    return new PBXFileReference(generateUUID(proj.allObjectKeys()), proj, {
      ...DEFAULTS,
      name: path.basename(frameworkPath),
      path: frameworkPath,
    });
  }

  static createFromAbsolutePath(
    filePath: string,
    fileType: string,
    proj: PBXProj
  ): PBXFileReference {
    return new PBXFileReference(generateUUID(proj.allObjectKeys()), proj, {
      ...DEFAULTS,
      name: path.basename(filePath),
      path: filePath,
      lastKnownFileType: fileType,
      sourceTree: "<absolute>",
    });
  }

  path(): string {
    return this._defn["path"];
  }

  fullPath(returnNullIfNotExists?: false): string;
  fullPath(returnNullIfNotExists: true): string | null;
  fullPath(returnNullIfNotExists?: boolean): string | null {
    const parents = findParents(this._id, this._proj.rootObject().mainGroup());

    if (parents === null) {
      if (returnNullIfNotExists) {
        return null;
      }

      throw (
        "Xcodejs ERROR! Child (" + this._id + ") could not be found in tree!"
      );
    }

    // TODO this assumes relative paths up the tree
    return path.join(
      this._proj._srcRoot,
      path.join(
        ...parents.map((ancestor) => {
          return ancestor.path() || "";
        })
      ),
      this.path()
    );
  }
}
