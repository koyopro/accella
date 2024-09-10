import { Meta, Model } from "../../index.js";
import { Validations } from "../../model/validations.js";
import { Validator } from "./index.js";

export type UniqunessOptions<T> = boolean | { scope: (keyof Meta<T>["Column"] & string)[] };

export class UniquenessValidator<T extends Validations> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: UniqunessOptions<T>
  ) {
    super(record);
  }
  validate() {
    let relation = (this.record.constructor as typeof Model).all();
    if (typeof this.options === "object" && this.options.scope) {
      for (const scope of this.options.scope) {
        relation = relation.where({
          [scope]: this.record[scope as keyof T],
        });
      }
    }
    const found = relation.where({ [this.attribute]: this.record[this.attribute] }).first();
    if (this.record instanceof Model && found?.equals(this.record as any) === false) {
      this.errors.add(this.attribute, "taken");
    }
  }
}
