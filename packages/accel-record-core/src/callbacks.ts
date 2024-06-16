import { Model } from "./index.js";

const callbackMethods = [
  "validation",
  "create",
  "save",
  "update",
  "destroy",
] as const;
type CallbackMethod = (typeof callbackMethods)[number];

/**
 * The `before` decorator registers a callback function to be executed before the specified method is called.
 *
 * @param method - The name of the method to add the callback to.
 */
export const before = (method: CallbackMethod) => {
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
export const after = (method: CallbackMethod) => {
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
    before: callbackMethods.toHash((m) => [m, [] as Function[]]),
    after: callbackMethods.toHash((m) => [m, [] as Function[]]),
  };

  /**
   * Runs the before callbacks for a given method.
   * @param method - The method for which to run the before callbacks.
   */
  protected runBeforeCallbacks(method: CallbackMethod) {
    for (const cb of this.callbacks.before[method]) {
      cb.call(this);
    }
  }

  /**
   * Runs the after callbacks for a given method.
   * @param method - The method for which to run the after callbacks.
   */
  protected runAfterCallbacks(method: CallbackMethod) {
    for (const cb of this.callbacks.after[method]) {
      cb.call(this);
    }
  }
}
