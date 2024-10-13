import { defineMiddleware } from "astro:middleware";
import { initDatabase } from "./core/database.js";
import { getSession } from "./session.js";

await initDatabase();

export const onRequest = defineMiddleware(({ locals, cookies, request, redirect }, next) => {
  locals.session = getSession(cookies);

  if (!locals.session.account && !request.url.startsWith("/signin")) {
    return redirect("/signin");
  }

  next();
});
