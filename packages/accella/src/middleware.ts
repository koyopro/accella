import { RecordNotFound } from "accel-record/errors";
import { RequestParameters } from "accel-web";
import { APIContext } from "astro";
import { ZodError } from "zod";
import { runInitializers } from "./initialize.js";
import { getSession } from "./session";
import { formAuthenticityToken, validateAuthenticityToken } from "accel-web/csrf";

await runInitializers();

export const onRequest = async (context: APIContext, next: any) => {
  const { cookies, request, params, locals } = context;
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);
  locals.authenticityToken = formAuthenticityToken(locals.session);

  validateAuthenticityToken(locals.params, locals.session, request);

  try {
    return await next();
  } catch (error) {
    if (error instanceof RecordNotFound) {
      return new Response(null, { status: 404 });
    }
    if (error instanceof ZodError) {
      return new Response(null, { status: 400 });
    }
    throw error;
  }
};
