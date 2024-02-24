import { rpcClient } from "./database";

export class Rollback extends Error {
  constructor() {
    super("Rollback");
  }
}

export class Transaction {
  static startTransaction() {
    rpcClient({ sql: "BEGIN;", bindings: [] });
  }

  static commitTransaction() {
    rpcClient({ sql: "COMMIT;", bindings: [] });
  }

  static rollbackTransaction() {
    rpcClient({ sql: "ROLLBACK;", bindings: [] });
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
