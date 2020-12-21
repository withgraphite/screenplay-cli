"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationString = exports.DestinationType = void 0;
var DestinationType;
(function (DestinationType) {
    DestinationType[DestinationType["debugSimulator"] = 0] = "debugSimulator";
    DestinationType[DestinationType["releaseDevice"] = 1] = "releaseDevice";
})(DestinationType = exports.DestinationType || (exports.DestinationType = {}));
function destinationString(destinationType) {
    switch (destinationType) {
        case DestinationType.debugSimulator: {
            return "'platform=iOS Simulator,name=iPhone 12'";
        }
        case DestinationType.releaseDevice: {
            return "'generic/platform=iOS'";
        }
    }
}
exports.destinationString = destinationString;
//# sourceMappingURL=destination_type.js.map