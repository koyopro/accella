function init() {
  return function (method) {
    if (method === "ping") {
      return "pong";
    }
    return "from mjs worker";
  };
}

export { init };
export default init;
