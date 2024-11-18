// @ts-check
import { defineConfig } from "astro/config";
import accella from "accella/integration";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [accella()],
});
