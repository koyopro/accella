import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";
import { initI18n } from "./core/i18n.js";
import { getSession } from "./session.js";

await initI18n();
await initDatabase();

export const onRequest = defineMiddleware(({ locals, cookies, request, redirect }, next) => {
  locals.session = getSession(cookies);

  const path = new URL(request.url).pathname;
  if (!locals.session.account && !path.startsWith("/sign")) {
    return redirect("/signin");
  }

  next();
});
