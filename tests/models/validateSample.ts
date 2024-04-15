import { ApplicationRecord } from "./applicationRecord.js";

export class ValidateSampleModel extends ApplicationRecord {
  validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
    this.validates("key", { presence: true });
    this.validates("pattern", { length: { minimum: 2, maximum: 5 } });
    this.validates("size", { inclusion: { in: ["small", "medium", "large"] } });
  }
}
