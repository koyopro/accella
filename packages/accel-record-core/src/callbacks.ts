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
] as const;

/**
 * The `before` decorator registers a callback function to be executed before the specified method is called.
 *
 * @param method - The name of the method to add the callback to.
 */
export const before = (method: (typeof methodsForBeforeCallback)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.before[method].push(originalMethod);
    });
    return originalMethod;
  };
};

/**
 * The `after` decorator registers a callback function to be executed after the specified method is called.
 *
 * @param method - The name of the method to add the callback to.
 */
export const after = (method: (typeof methodsForAfterCallback)[number]) => {
  return function (originalMethod: (...args: any[]) => any, context: any) {
    context.addInitializer(function (this: Model) {
      this.callbacks.after[method].push(originalMethod);
    });
    return originalMethod;
  };
};

/**
 * Represents a class that manages callbacks.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Callbacks {
  /**
   * An object that stores the callbacks.
   */
  callbacks = {
    before: methodsForBeforeCallback.toHash((m) => [m, [] as Function[]]),
    after: methodsForAfterCallback.toHash((m) => [m, [] as Function[]]),
  };

  /**
   * Runs the before callbacks for a given method.
   * @param method - The method for which to run the before callbacks.
   */
  protected runBeforeCallbacks(
    method: (typeof methodsForBeforeCallback)[number]
  ) {
    for (const cb of this.callbacks.before[method]) {
      cb.call(this);
    }
  }

  /**
   * Runs the after callbacks for a given method.
   * @param method - The method for which to run the after callbacks.
   */
  protected runAfterCallbacks(
    method: (typeof methodsForAfterCallback)[number]
  ) {
    for (const cb of this.callbacks.after[method]) {
      cb.call(this);
    }
  }
}
