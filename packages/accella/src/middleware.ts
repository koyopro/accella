import { RecordNotFound } from "accel-record/errors";
import { RequestParameters } from "accel-web";
import { defineAuthenticityToken, validateAuthenticityToken } from "accel-web/csrf";
import { APIContext } from "astro";
import { ZodError } from "zod";
import { runInitializers } from "./initialize.js";
import { getSession } from "./session";

await runInitializers();

export const onRequest = async (context: APIContext, next: any) => {
  const { cookies, request, params, locals } = context;
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);

  defineAuthenticityToken(locals, locals.session);
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
