import { ApplicationRecord } from "./applicationRecord.js";

export class ValidateSampleModel extends ApplicationRecord {
  validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
    this.validates("pattern", {
      length: { minimum: 2, maximum: 5 },
      format: { with: /^[a-z]+$/ },
    });
    this.validates("size", { inclusion: { in: ["small", "medium", "large"] } });

    this.validates("key", { presence: true });
    if (this.key && !/^[a-z]$/.test(this.key[0])) {
      this.errors.add("key", "should start with a lowercase letter");
    }
  }
}
