import { Model } from "../../index.js";
import { DefualtOptions, Validator } from "./index.js";

export type FormatOptions = {
  with: RegExp;
} & DefualtOptions;

export class FormatValidator<T extends Model> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: FormatOptions
  ) {
    super(record);
  }
  validate() {
    if (!this.options.with.test(this.record[this.attribute] as any)) {
      this.errors.add(this.attribute, this.options.message ?? "is invalid");
    }
  }
}
