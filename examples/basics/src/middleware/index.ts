import { defineMiddleware, sequence } from "astro:middleware";
import { setupDatabase } from "../config/database";
import { getSession } from "../config/session";

await setupDatabase();

const accelWeb = defineMiddleware(async ({ locals, cookies }, next) => {
  locals.session = getSession(cookies);
  return next();
});

export const onRequest = sequence(accelWeb);
