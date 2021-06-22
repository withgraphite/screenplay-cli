import * as t from "retype";

const FEATURE_FLAGS = {
  killswitch: t.boolean,
  killswitchReason: t.string,
  rotoscopeKillswitch: t.boolean,
  useRollbackFlowRedesign: t.boolean,
};

export default FEATURE_FLAGS;
