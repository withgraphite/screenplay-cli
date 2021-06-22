import * as t from "retype";
declare const FEATURE_FLAGS: {
    killswitch: t.BooleanType;
    killswitchReason: t.StringType;
    rotoscopeKillswitch: t.BooleanType;
    useRollbackFlowRedesign: t.BooleanType;
};
export default FEATURE_FLAGS;
