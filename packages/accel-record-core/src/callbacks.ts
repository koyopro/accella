import { Model } from "./index.js";

export const befores = [
  "validation",
  "create",
  "save",
  "update",
  "destroy",
] as const;
export const afters = [
  "validation",
  "create",
  "save",
  "update",
  "destroy",
  "commit",
  "rollback",
] as const;
export const hashOfArray = <T extends readonly string[]>(
  array: T
): Record<T[number], Function[]> => {
  const ret = {} as any;
  for (const item of array) {
    ret[item] = [];
  }
  return ret;
};

export const before = (method: (typeof befores)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.before[method].push(originalMethod);
    });
    return originalMethod;
  };
};

export const after = (method: (typeof afters)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.after[method].push(originalMethod);
    });
    return originalMethod;
  };
};

export class Callbacks {
  callbacks = {
    before: hashOfArray(befores),
    after: hashOfArray(afters),
  };

  runBeforeCallbacks(method: (typeof befores)[number]) {
    for (const cb of this.callbacks.before[method]) {
      cb.call(this);
    }
  }

  runAfterCallbacks(method: (typeof afters)[number]) {
    for (const cb of this.callbacks.after[method]) {
      cb.call(this);
    }
  }
}
