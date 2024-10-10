import { defineConfig } from "astro/config";
import "dotenv/config";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  })
});