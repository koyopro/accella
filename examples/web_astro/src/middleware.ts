import { defineMiddleware } from "astro/middleware";
import { initDatabase } from "./core/database.js";
import { Helper } from "./core/helper.js";
import { initI18n } from "./core/i18n.js";

await initDatabase();
await initI18n();

export const onRequest = defineMiddleware(async (context, next) => {
  const helper = await Helper.init(context);
  if (helper.needSignIn) {
    return context.redirect("/signin");
  }
  context.locals.helper = helper;
  return next();
});
