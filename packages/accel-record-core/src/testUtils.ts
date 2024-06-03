import { Model } from "./index.js";

export class DatabaseCleaner {
  static start() {
    Model.startNestableTransaction();
  }

  static clean() {
    Model.rollbackNestableTransaction();
  }
}
