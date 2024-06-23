import { Relation } from "./relation/index.js";

export function scope(
  method: (...args: any[]) => Relation<any, any>,
  context: any
) {
  (method as any).isAccelRecordScope = true;
  return method;
}
