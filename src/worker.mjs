function init() {
  return function (params) {
    // console.log(params);
    const { method, args } = params || {};
    if (actions[method]) {
      return actions[method]?.(...(args || []));
    }
    return "from mjs worker";
  };
}

export const actions = {
  incr: (a) => a + 1,
  ping: () => "pong",
};

export { init };
export default init;
