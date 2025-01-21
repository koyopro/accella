import { formAuthenticityToken, validateAuthenticityToken } from "accel-web/csrf";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, request, redirect } = context;

  const path = new URL(request.url).pathname;
  if (!locals.session.account && !path.startsWith("/sign")) {
    return redirect("/signin");
  }

  validateAuthenticityToken(locals.params, locals.session, request);

  locals.authenticityToken = formAuthenticityToken(locals.session);

  return next();
});
