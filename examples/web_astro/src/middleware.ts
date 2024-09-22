import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";
import { initI18n } from "./core/i18n.js";

await initI18n();
await initDatabase();

export const onRequest = defineMiddleware((_context, next) => {
  next();
});
