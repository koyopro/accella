import { ApplicationRecord } from "./applicationRecord.js";

export class TodoModel extends ApplicationRecord {
  override validateAttributes() {
    super.validateAttributes();
    this.validates("title", { presence: true });
  }
}
