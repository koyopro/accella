// src/worker.ts
var defineRpcSyncActions = (actions) => () => {
  return async function(params) {
    const { method, args } = params || {};
    return actions[method]?.(args);
  };
};
var worker_default = defineRpcSyncActions({
  incr: async (a) => a + 1,
  ping: () => "pong!!"
});
export {
  worker_default as default
};
