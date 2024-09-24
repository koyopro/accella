// src/worker.ts
var defineRpcSyncActions = (actions) => {
  return () => {
    return async function(params) {
      const { method, args } = params || {};
      const action = actions[method];
      if (action) {
        return action(...args || []);
      }
      return "from mjs worker";
    };
  };
};
var worker_default = defineRpcSyncActions({
  incr: async (a) => a + 1,
  ping: () => "pong!!"
});
export {
  worker_default as default
};
