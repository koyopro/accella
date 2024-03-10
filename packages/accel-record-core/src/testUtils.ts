import { Model } from "./index.js";

export class DatabaseCleaner {
  static start() {
    Model.startTransaction();
  }

  static clean() {
    Model.rollbackTransaction();
  }
}
