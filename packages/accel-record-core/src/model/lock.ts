import { Model } from "../index.js";

export type LockType = "forUpdate" | "forShare" | undefined;
/**
 * Represents a lock that can be applied to a query when executing a SELECT statement.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Lock {
  /**
   * Applies a lock to the query when executing a SELECT statement.
   *
   * @param type The type of lock to apply. Defaults to "forUpdate".
   */
  static lock<T extends typeof Model>(this: T, type: LockType = "forUpdate") {
    return this.all().lock(type);
  }

  lock<T extends Model>(this: T, type: LockType = "forUpdate") {
    return this.reload({ lock: type });
  }

  withLock<T extends Model, R>(this: T, callback: () => R): R | undefined;
  withLock<T extends Model, R>(
    this: T,
    type: LockType,
    callback: () => R
  ): R | undefined;
  withLock<T extends Model, R>(this: T, ...args: any[]): R | undefined {
    const type = (args.length >= 2 ? args[0] : "forUpdate") as LockType;
    const callback = args.at(-1) as () => R;
    return this.class().transaction(() => {
      this.lock(type);
      return callback();
    });
  }
}
