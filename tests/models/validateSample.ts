import { Validator } from "accel-record";
import { validates } from "accel-record/validations";
import { ApplicationRecord } from "./applicationRecord.js";

class MyValidator extends Validator<{ key: string | undefined }> {
  validate() {
    if (this.record.key === "xs") {
      this.errors.add("key", "should not be xs");
    }
  }
}

class ValidateSampleBase extends ApplicationRecord {
  static validations: any = validates(this, [MyValidator]);
}

export class ValidateSampleModel extends ValidateSampleBase {
  static validations = validates(this, [
    ["accepted", { acceptance: true }],
    [
      "pattern",
      {
        length: { minimum: 2, maximum: 5 },
        format: { with: /^[a-z]+$/, message: "only allows lowercase letters" },
      },
    ],
    [["key", "size"], { presence: true }],
  ]);

  override validateAttributes() {
    this.validates("size", { inclusion: { in: ["small", "medium", "large"] } });

    this.validates(["key", "size"], { presence: true });
    this.validates("key", { uniqueness: true });

    if (this.key && !/^[a-z]$/.test(this.key[0])) {
      this.errors.add("key", "should start with a lowercase letter");
    }
  }
}
