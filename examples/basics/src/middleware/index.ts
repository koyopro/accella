import { RequestParameters } from "accel-web";
import { defineMiddleware, sequence } from "astro:middleware";
import { setupDatabase } from "../config/database";
import { getSession } from "../config/session";

await setupDatabase();

const accelWeb = defineMiddleware(async ({ locals, cookies, request, params }, next) => {
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);
  return next();
});

export const onRequest = sequence(accelWeb);
