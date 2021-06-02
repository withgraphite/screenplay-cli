"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationString = exports.DestinationType = exports.BuildSettings = exports.XCSchemes = exports.Utils = exports.XCSettings = exports.XCWorkspace = exports.XCConfig = exports.PlistMergeStrategies = exports.Plist = exports.PBXTargetProxy = exports.PBXTargetDependency = exports.PBXRootObject = exports.PBXCopyFilesBuildPhase = exports.PBXProject = exports.PBXObject = exports.PBXNativeTarget = exports.PBXGroup = exports.PBXFileReference = exports.PBXBuildFile = exports.PBXBuildPhase = exports.PBXBuildConfigList = exports.PBXBuildConfig = exports.IncompatiblePlistError = void 0;
const build_settings_1 = __importDefault(require("./src/build_settings"));
exports.BuildSettings = build_settings_1.default;
const destination_type_1 = require("./src/destination_type");
Object.defineProperty(exports, "destinationString", { enumerable: true, get: function () { return destination_type_1.destinationString; } });
Object.defineProperty(exports, "DestinationType", { enumerable: true, get: function () { return destination_type_1.DestinationType; } });
const pbx_build_config_1 = __importDefault(require("./src/pbx_build_config"));
exports.PBXBuildConfig = pbx_build_config_1.default;
const pbx_build_config_list_1 = __importDefault(require("./src/pbx_build_config_list"));
exports.PBXBuildConfigList = pbx_build_config_list_1.default;
const pbx_build_file_1 = __importDefault(require("./src/pbx_build_file"));
exports.PBXBuildFile = pbx_build_file_1.default;
const pbx_build_phase_1 = __importDefault(require("./src/pbx_build_phase"));
exports.PBXBuildPhase = pbx_build_phase_1.default;
const pbx_copy_files_build_phase_1 = __importDefault(require("./src/pbx_copy_files_build_phase"));
exports.PBXCopyFilesBuildPhase = pbx_copy_files_build_phase_1.default;
const pbx_file_reference_1 = __importDefault(require("./src/pbx_file_reference"));
exports.PBXFileReference = pbx_file_reference_1.default;
const pbx_group_1 = __importDefault(require("./src/pbx_group"));
exports.PBXGroup = pbx_group_1.default;
const pbx_native_target_1 = __importDefault(require("./src/pbx_native_target"));
exports.PBXNativeTarget = pbx_native_target_1.default;
const pbx_object_1 = __importDefault(require("./src/pbx_object"));
exports.PBXObject = pbx_object_1.default;
const pbx_project_1 = __importDefault(require("./src/pbx_project"));
exports.PBXProject = pbx_project_1.default;
const pbx_root_object_1 = __importDefault(require("./src/pbx_root_object"));
exports.PBXRootObject = pbx_root_object_1.default;
const pbx_target_dependency_1 = __importDefault(require("./src/pbx_target_dependency"));
exports.PBXTargetDependency = pbx_target_dependency_1.default;
const pbx_target_proxy_1 = __importDefault(require("./src/pbx_target_proxy"));
exports.PBXTargetProxy = pbx_target_proxy_1.default;
const plist_1 = require("./src/plist");
Object.defineProperty(exports, "IncompatiblePlistError", { enumerable: true, get: function () { return plist_1.IncompatiblePlistError; } });
Object.defineProperty(exports, "Plist", { enumerable: true, get: function () { return plist_1.Plist; } });
Object.defineProperty(exports, "PlistMergeStrategies", { enumerable: true, get: function () { return plist_1.PlistMergeStrategies; } });
const Utils = __importStar(require("./src/utils"));
exports.Utils = Utils;
const xcconfig_1 = require("./src/xcconfig");
Object.defineProperty(exports, "XCConfig", { enumerable: true, get: function () { return xcconfig_1.XCConfig; } });
const XCSchemes = __importStar(require("./src/xcschemes"));
exports.XCSchemes = XCSchemes;
const xcsettings_1 = require("./src/xcsettings");
Object.defineProperty(exports, "XCSettings", { enumerable: true, get: function () { return xcsettings_1.XCSettings; } });
const xcworkspace_1 = require("./src/xcworkspace");
Object.defineProperty(exports, "XCWorkspace", { enumerable: true, get: function () { return xcworkspace_1.XCWorkspace; } });
//# sourceMappingURL=index.js.map