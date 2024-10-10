import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";

await initDatabase();

export const onRequest = defineMiddleware((_context, next) => {
  next();
});
