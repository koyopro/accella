import path from "path";

export default {
  test: {
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "./src"),
    },
  },
};
