import { RecordNotFound } from "accel-record/errors";
import { RequestParameters } from "accel-web";
import { APIContext } from "astro";
import { ZodError } from "zod";
import { Accel } from "./index.js";
import { getSession } from "./session";

const setup = async () => {
  const path = Accel.root.child("src/config/database").toString();
  try {
    const setupDatabase = (await import(/* @vite-ignore */ path)).default;
    await setupDatabase();
  } catch (error) {
    console.warn("Error setting up database", error);
  }
};
await setup();

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
