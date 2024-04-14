import { ApplicationRecord } from "./applicationRecord.js";

export class ValidateSampleModel extends ApplicationRecord {
  validates(attribute, options) {
    if (options.acceptance) {
      if (!this[attribute]) {
        this.errors.add(attribute, "must be accepted");
      }
    }
  }

  override validate() {
    super.validate();
    this.validates("accepted", { acceptance: true });
  }
}
