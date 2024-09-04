import { Validations } from "../../model/validations.js";
import { DefualtOptions, Validator } from "./index.js";

export type LengthOptions = {
  minimum?: number;
  maximum?: number;
} & DefualtOptions;

export class LengthValidator<T extends Validations> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: LengthOptions
  ) {
    super(record);
  }
  validate() {
    const value = this.record[this.attribute] as any;
    if (this.options.minimum && value.length < this.options.minimum) {
      this.errors.add(this.attribute, this.options.message ?? "tooShort", {
        count: this.options.minimum,
      });
    }
    if (this.options.maximum && value.length > this.options.maximum) {
      this.errors.add(this.attribute, this.options.message ?? "tooLong", {
        count: this.options.maximum,
      });
    }
  }
}
