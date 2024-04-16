import { Validator } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

class MyValidator extends Validator {
  constructor(record: { key: string | undefined }) {
    super(record);
  }

  validate() {
    if (this.record.key === "xs") {
      this.errors.add("key", "should not be xs");
    }
  }
}

export class ValidateSampleModel extends ApplicationRecord {
  validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
    this.validates("pattern", {
      length: { minimum: 2, maximum: 5 },
      format: { with: /^[a-z]+$/ },
    });
    this.validates("size", { inclusion: { in: ["small", "medium", "large"] } });

    this.validates(["key", "size"], { presence: true });

    if (this.key && !/^[a-z]$/.test(this.key[0])) {
      this.errors.add("key", "should start with a lowercase letter");
    }
    this.validatesWith(new MyValidator(this));
  }
}
