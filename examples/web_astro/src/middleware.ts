import { validateAuthenticityToken } from "accel-web/dist/csrf";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, request, redirect } = context;

  const path = new URL(request.url).pathname;
  if (!locals.session.account && !path.startsWith("/sign")) {
    return redirect("/signin");
  }

  validateAuthenticityToken(locals.params, locals.session, request);

  return next();
});
