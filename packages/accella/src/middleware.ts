import { RecordNotFound } from "accel-record/errors";
import { RequestParameters } from "accel-web";
import { APIContext } from "astro";
import { ZodError } from "zod";
import { getSession } from "./session";

export const onRequest = async (context: APIContext, next: any) => {
  const { cookies, request, params, locals } = context;
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);
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
