import { RequestParameters } from "accel-web";
import { getSession } from "./session";

export const onRequest = async ({ locals, request, params, cookies }: any, next: any) => {
  locals.session = getSession(cookies);
  locals.params = await RequestParameters.from(request, params);
  return next();
};
