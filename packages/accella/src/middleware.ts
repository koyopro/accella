import { RequestParameters } from "accel-web";
import { getSession } from "./session";

export const onRequest = async ({ locals, request, params }: any, next: any) => {
  locals.session = getSession(request.cookies);
  locals.params = await RequestParameters.from(request, params);
  return next();
};
