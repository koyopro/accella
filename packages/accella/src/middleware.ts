import { RequestParameters } from "accel-web";

export const onRequest = async ({ locals, request, params }: any, next: any) => {
  locals.params = await RequestParameters.from(request, params);
  return next();
};
