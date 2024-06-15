import { Model } from "./index.js";

const methodsForBeforeCallback = [
  "validation",
  "create",
  "save",
  "update",
  "destroy",
] as const;
const methodsForAfterCallback = [
  "validation",
  "create",
  "save",
  "update",
  "destroy",
  "commit",
  "rollback",
] as const;

const makeHashOfArray = <T extends readonly string[]>(
  array: T
): Record<T[number], Function[]> => {
  const ret = {} as any;
  for (const item of array) {
    ret[item] = [];
  }
  return ret;
};

export const before = (method: (typeof methodsForBeforeCallback)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.before[method].push(originalMethod);
    });
    return originalMethod;
  };
};

export const after = (method: (typeof methodsForAfterCallback)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.after[method].push(originalMethod);
    });
    return originalMethod;
  };
};

export class Callbacks {
  callbacks = {
    before: makeHashOfArray(methodsForBeforeCallback),
    after: makeHashOfArray(methodsForAfterCallback),
  };

  protected runBeforeCallbacks(
    method: (typeof methodsForBeforeCallback)[number]
  ) {
    for (const cb of this.callbacks.before[method]) {
      cb.call(this);
    }
  }

  protected runAfterCallbacks(
    method: (typeof methodsForAfterCallback)[number]
  ) {
    for (const cb of this.callbacks.after[method]) {
      cb.call(this);
    }
  }
}
