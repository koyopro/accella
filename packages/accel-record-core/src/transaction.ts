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
  static transactionStack: number[] = [];
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
    const latest = this.transactionStack[this.transactionStack.length - 1] ?? 0;
    this.transactionStack.push(latest + 1);
    if (latest == 0) {
      execSQL({ sql: "BEGIN;", bindings: [] });
    } else {
      execSQL({ sql: `SAVEPOINT accel_record_${latest};`, bindings: [] });
    }
    try {
      callback();
    } catch (e) {
      if (e instanceof Rollback) {
        if (latest == 0) {
          execSQL({ sql: "ROLLBACK;", bindings: [] });
        } else {
          execSQL({
            sql: `ROLLBACK TO SAVEPOINT accel_record_${latest};`,
            bindings: [],
          });
        }
        this.transactionStack.pop();
        return;
      } else {
        throw e;
      }
    }
    if (latest == 0) {
      this.commitTransaction();
    }
    this.transactionStack.pop();
  }
}
