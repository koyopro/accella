import { ApplicationRecord } from "./applicationRecord.js";

export class PostModel extends ApplicationRecord {
  override validateAttributes() {
    this.validates("title", { presence: true });
  }
}
