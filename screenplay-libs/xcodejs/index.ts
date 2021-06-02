import BuildSettings from "./src/build_settings";
import { destinationString, DestinationType } from "./src/destination_type";
import PBXBuildConfig from "./src/pbx_build_config";
import PBXBuildConfigList from "./src/pbx_build_config_list";
import PBXBuildFile from "./src/pbx_build_file";
import PBXBuildPhase from "./src/pbx_build_phase";
import PBXCopyFilesBuildPhase from "./src/pbx_copy_files_build_phase";
import PBXFileReference from "./src/pbx_file_reference";
import PBXGroup from "./src/pbx_group";
import PBXNativeTarget from "./src/pbx_native_target";
import PBXObject from "./src/pbx_object";
import PBXProject from "./src/pbx_project";
import PBXRootObject from "./src/pbx_root_object";
import PBXTargetDependency from "./src/pbx_target_dependency";
import PBXTargetProxy from "./src/pbx_target_proxy";
import {
  IncompatiblePlistError,
  Plist,
  PlistMergeStrategies,
  PlistMergeStrategy as PlistMergeStrategyT,
  PlistOverrides as PlistOverridesT,
} from "./src/plist";
import * as PorkspaceType from "./src/porkspace_type";
import * as Utils from "./src/utils";
import { XCConfig } from "./src/xcconfig";
import * as XCSchemes from "./src/xcschemes";
import { XCSettings } from "./src/xcsettings";
import { XCWorkspace } from "./src/xcworkspace";

export {
  IncompatiblePlistError,
  PBXBuildConfig,
  PBXBuildConfigList,
  PBXBuildPhase,
  PBXBuildFile,
  PBXFileReference,
  PBXGroup,
  PBXNativeTarget,
  PBXObject,
  PBXProject,
  PBXCopyFilesBuildPhase,
  PBXRootObject,
  PBXTargetDependency,
  PBXTargetProxy,
  Plist,
  PlistMergeStrategies,
  XCConfig,
  XCWorkspace,
  XCSettings,
  Utils,
  XCSchemes,
  BuildSettings,
  DestinationType,
  destinationString,
};

export type PorkspacePath = PorkspaceType.PorkspacePath;
export type PlistOverrides = PlistOverridesT;
export type PlistMergeStrategy = PlistMergeStrategyT;
