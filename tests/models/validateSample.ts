import { ApplicationRecord } from "./applicationRecord.js";

const isBlank = (value: any) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return value == undefined;
};

export class ValidateSampleModel extends ApplicationRecord {
  validates(attribute, options) {
    const value = this[attribute];
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
    if (options.length && value != undefined) {
      if (value.length < options.length.minimum) {
        this.errors.add(
          attribute,
          `is too short (minimum is ${options.length.minimum} characters)`
        );
      }
      if (value.length > options.length.maximum) {
        this.errors.add(
          attribute,
          `is too long (maximum is ${options.length.maximum} characters)`
        );
      }
    }
  }

  override validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
    this.validates("key", { presence: true });
    this.validates("pattern", { length: { minimum: 2, maximum: 5 } });
  }
}
