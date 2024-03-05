import path from "path";

export default {
  test: {
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
};
