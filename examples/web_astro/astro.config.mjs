import accella from "accella/integration";
import { defineConfig } from "astro/config";
import "dotenv/config";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [accella()],
  adapter: node({
    mode: "standalone",
  }),
});
