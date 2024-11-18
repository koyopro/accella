import { defineMiddleware } from "astro:middleware";
import { setupDatabase } from "../config/database";

await setupDatabase();

export const onRequest = defineMiddleware(async (_, next) => {
  // You can add your own middleware logic here
  return next();
});
