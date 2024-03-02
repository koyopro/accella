import { execSQL } from "./database";

export class Rollback extends Error {
  constructor() {
    super("Rollback");
  }
}

export class Transaction {
  static startTransaction() {
    execSQL({ sql: "BEGIN;", bindings: [] });
  }

  static commitTransaction() {
    execSQL({ sql: "COMMIT;", bindings: [] });
  }

  static rollbackTransaction() {
    execSQL({ sql: "ROLLBACK;", bindings: [] });
  }

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
