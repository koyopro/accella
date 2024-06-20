export function scope(method, context) {
  method.isAccelRecordScope = true;
  return method;
}
