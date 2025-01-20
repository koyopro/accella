import type { AstroIntegration } from "astro";

const integration: AstroIntegration = {
  name: "accella-integration",
  hooks: {
    "astro:config:setup": ({ addMiddleware }) => {
      addMiddleware({
        entrypoint: "accella/middleware",
        order: "pre",
      });
    },
  },
};

export default () => integration;
