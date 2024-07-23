import path from "path";
import { getViteConfig } from "astro/config";

export default getViteConfig({
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
