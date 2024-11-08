import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";
import { initI18n } from "./core/i18n.js";
import { getSession } from "./session.js";
import { RequestParameters } from "accel-web";

await initI18n();
await initDatabase();

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, request, redirect, params } = context;
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);

  const path = new URL(request.url).pathname;
  if (!locals.session.account && !path.startsWith("/sign")) {
    return redirect("/signin");
  }

  return next();
});
