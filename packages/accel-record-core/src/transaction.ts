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
   * Executes a transaction by invoking the provided callback function.
   * If an exception of type `Rollback` is thrown within the callback, the transaction will be rolled back.
   * Otherwise, the transaction will be committed.
   * @param callback - The callback function to be executed within the transaction.
   */
  static transaction(callback: () => void) {
    this.startTransaction();
    try {
      callback();
    } catch (e) {
      if (e instanceof Rollback) {
        this.rollbackTransaction();
        return;
      } else {
        throw e;
      }
    }
    this.commitTransaction();
  }
}
