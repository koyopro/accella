import { Knex } from "knex";
import { Meta, Model, Relation } from "../index.js";

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
   * @example
   * ```typescript
   * User.transaction(() => {
   *   const user1 = User.lock().find(1);
   *   const user2 = User.lock().find(2);
   *
   *   user1.point += 100;
   *   user2.point -= 100;
   *
   *   user1.save();
   *   user2.save();
   * });
   * ```
   */
  static lock<T extends typeof Model>(
    this: T,
    type: LockType = "forUpdate"
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
    return this.all().lock(type);
  }

  /**
   * Locks the model instance for a specific type of operation.
   *
   * @param type The type of lock to apply. Defaults to "forUpdate".
   * @returns the reloaded model instance.
   */
  lock<T extends Model>(this: T, type: LockType = "forUpdate") {
    return this.reload({ lock: type });
  }

  /**
   * Executes a callback function within a transaction, applying a lock to the model instance.
   *
   * @param callback The callback function to execute within the transaction.
   * @returns The result of the callback function.
   * @example
   * ```typescript
   * const user = User.find(1);
   * user.withLock(() => {
   *   user.update({ name: "bar" })
   * });
   * ```
   */
  withLock<T extends Model, R>(this: T, callback: () => R): R | undefined;
  /**
   * Executes a callback function within a transaction, applying a specific type of lock to the model instance.
   *
   * @param type The type of lock to apply.
   * @param callback The callback function to execute within the transaction.
   * @returns The result of the callback function.
   * @example
   * ```typescript
   * const user = User.find(1);
   * user.withLock('forShare', () => {
   *   user.update({ name: "bar" })
   * });
   * ```
   */
  withLock<T extends Model, R>(this: T, type: LockType, callback: () => R): R | undefined;
  withLock<T extends Model, R>(this: T, ...args: any[]): R | undefined {
    const type = (args.length >= 2 ? args[0] : "forUpdate") as LockType;
    const callback = args.at(-1) as () => R;
    return this.class().transaction(() => {
      this.lock(type);
      return callback();
    });
  }
}

/**
 * Applies a lock to a Knex query builder based on the specified lock type.
 * @param queryBuilder - The Knex query builder to apply the lock to.
 * @param lockType - The type of lock to apply.
 * @returns The modified query builder with the lock applied.
 */
export const affectLock = (queryBuilder: Knex.QueryBuilder, lockType: LockType) => {
  switch (lockType) {
    case "forShare":
      return queryBuilder.forShare();
    case "forUpdate":
      return queryBuilder.forUpdate();
    default:
      return queryBuilder;
  }
};
