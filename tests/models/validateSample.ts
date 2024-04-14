import { ApplicationRecord } from "./applicationRecord.js";

const isBlank = (value: any) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return value == undefined;
};

export class ValidateSampleModel extends ApplicationRecord {
  validates(attribute, options) {
    if (options.acceptance) {
      if (!this[attribute]) {
        this.errors.add(attribute, "must be accepted");
      }
    }
    if (options.presence) {
      if (isBlank(this[attribute])) {
        this.errors.add(attribute, "can't be blank");
      }
    }
  }

  override validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
    this.validates("key", { presence: true });
  }
}
