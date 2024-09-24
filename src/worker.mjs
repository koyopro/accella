function init() {
  return function () {
    return "from mjs worker";
  };
}

export { init };
export default init;
