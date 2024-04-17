import { DefualtOptions, Validator } from "./index.js";

export type LengthOptions = {
  minimum?: number;
  maximum?: number;
} & DefualtOptions;

export class LengthValidator extends Validator {
  constructor(
    record: any,
    private attribute: keyof typeof record & string,
    private options: LengthOptions
  ) {
    super(record);
  }
  validate() {
    const value = this.record[this.attribute] as any;
    if (this.options.minimum && value.length < this.options.minimum) {
      this.errors.add(
        this.attribute,
        this.options.message ??
          `is too short (minimum is ${this.options.minimum} characters)`
      );
    }
    if (this.options.maximum && value.length > this.options.maximum) {
      this.errors.add(
        this.attribute,
        this.options.message ??
          `is too long (maximum is ${this.options.maximum} characters)`
      );
    }
  }
}
