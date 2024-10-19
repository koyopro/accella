import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["./tests/**/*.test.{js,ts}"],
    setupFiles: ["./tests/vitest.setup.ts"],
  },
  esbuild: {
    target: "es2022",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
});
