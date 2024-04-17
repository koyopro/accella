import { DefualtOptions, Validator } from "./index.js";

export type FormatOptions = {
  with: RegExp;
} & DefualtOptions;

export class FormatValidator extends Validator {
  constructor(
    record: any,
    private attribute: keyof typeof record & string,
    private options: FormatOptions
  ) {
    super(record);
  }
  validate() {
    if (!this.options.with.test(this.record[this.attribute])) {
      this.errors.add(this.attribute, this.options.message ?? "is invalid");
    }
  }
}
