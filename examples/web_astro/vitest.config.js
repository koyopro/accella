import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
});
