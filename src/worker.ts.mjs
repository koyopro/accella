// src/worker.ts
function init() {
  return async function(params) {
    const { method, args } = params || {};
    const action = actions[method];
    if (action) {
      return action(...args || []);
    }
    return "from mjs worker";
  };
}
var actions = {
  incr: async (a) => a + 1,
  ping: () => "pong!"
};
var worker_default = init;
export {
  actions,
  worker_default as default,
  init
};
