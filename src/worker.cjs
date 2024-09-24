function init() {
  return function () {
    return "from worker";
  };
}

module.exports = init;
