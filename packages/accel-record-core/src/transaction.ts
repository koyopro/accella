import { execSQL } from "./database.js";

export class Rollback extends Error {
  constructor() {
    super("Rollback");
  }
}

/**
 * Represents a transaction for executing SQL statements.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Transaction {
  protected static transactionCount: number = 0;
  /**
   * Starts a new transaction.
   */
  static startTransaction() {
    execSQL({ sql: "BEGIN;", bindings: [] });
  }

  /**
   * Commits the current transaction.
   */
  static commitTransaction() {
    execSQL({ sql: "COMMIT;", bindings: [] });
  }

  /**
   * Rolls back the current transaction.
   */
  static rollbackTransaction() {
    execSQL({ sql: "ROLLBACK;", bindings: [] });
  }

  /**
   * Starts a nestable transaction.
   * If the transaction count is 0, it begins a new transaction using the `BEGIN;` SQL statement.
   * If the transaction count is greater than 0, it creates a savepoint using the `SAVEPOINT` SQL statement.
   */
  static startNestableTransaction() {
    if (this.transactionCount == 0) {
      execSQL({ sql: "BEGIN;", bindings: [] });
    } else {
      execSQL({
        sql: `SAVEPOINT accel_record_${this.transactionCount};`,
        bindings: [],
      });
    }
    this.transactionCount++;
  }

  /**
   * Rolls back the current nestable transaction.
   * Decrements the transaction count and rolls back to the appropriate savepoint or performs a full rollback if no savepoints remain.
   */
  static rollbackNestableTransaction() {
    this.transactionCount--;
    if (this.transactionCount == 0) {
      execSQL({ sql: "ROLLBACK;", bindings: [] });
    } else {
      execSQL({
        sql: `ROLLBACK TO SAVEPOINT accel_record_${this.transactionCount};`,
        bindings: [],
      });
    }
  }

  /**
   * Decrements the transaction count and attempts to commit the nestable transaction.
   * If the transaction count reaches 0, the transaction is committed.
   */
  static tryCommitNestableTransaction() {
    this.transactionCount--;
    if (this.transactionCount == 0) {
      execSQL({ sql: "COMMIT;", bindings: [] });
    }
  }

  /**
   * Executes a transaction by starting a nestable transaction, executing the provided callback,
   * and then attempting to commit the transaction.
   * If an error occurs during the callback execution, the transaction is rolled back.
   *
   * @param callback - The callback function to be executed within the transaction.
   * @returns The return value of the callback function. If the transaction is rolled back, `undefined` is returned.
   */
  static transaction<F extends () => Promise<any>>(
    callback: F
  ): Promise<Awaited<ReturnType<F>> | undefined>;
  static transaction<F extends () => any>(
    callback: F
  ): ReturnType<F> | undefined;
  static transaction<F extends () => any>(callback: F): any {
    if (callback.constructor.name === "AsyncFunction") {
      return this.transactionAsync(callback);
    }
    let result = undefined;
    this.startNestableTransaction();
    try {
      result = callback();
    } catch (e) {
      this.rollbackNestableTransaction();
      if (e instanceof Rollback) {
        return undefined;
      } else {
        throw e;
      }
    }
    this.tryCommitNestableTransaction();
    return result;
  }

  protected static transactionAsync<F extends () => Promise<any>>(
    callback: F
  ): Promise<Awaited<ReturnType<F>> | undefined> {
    return new Promise(async (resolve, reject) => {
      let result = undefined;
      this.startNestableTransaction();
      try {
        result = await callback();
      } catch (e) {
        this.rollbackNestableTransaction();
        if (e instanceof Rollback) {
          resolve(undefined);
        } else {
          reject(e);
        }
        return;
      }
      this.tryCommitNestableTransaction();
      resolve(result);
    });
  }
}
