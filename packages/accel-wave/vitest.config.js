import path from "path";
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globals: true,
    setupFiles: ["tests/setup.ts"],
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
