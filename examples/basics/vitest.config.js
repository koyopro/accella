import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globals: true,
    include: ["./tests/**/*.test.{js,ts}"],
    setupFiles: ["./tests/setup.ts"],
    pool: "threads",
  },
  esbuild: {
    target: "node18",
  },
});
