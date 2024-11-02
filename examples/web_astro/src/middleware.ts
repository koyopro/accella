import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";
import { initI18n } from "./core/i18n.js";
import { getSession } from "./session.js";
import { RequestParameters } from "accel-web";

await initI18n();
await initDatabase();

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request);

  const path = new URL(request.url).pathname;
  if (!locals.session.account && !path.startsWith("/sign")) {
    redirect("/signin");
    return;
  }

  next();
});
