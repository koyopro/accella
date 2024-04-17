import { DefualtOptions, Validator } from "./index.js";

export type InclusionOptions = {
  in: any[];
} & DefualtOptions;

export class InclusionValidator extends Validator {
  constructor(
    record: any,
    private attribute: keyof typeof record & string,
    private options: InclusionOptions
  ) {
    super(record);
  }
  validate() {
    if (!this.options.in.includes(this.record[this.attribute])) {
      this.errors.add(
        this.attribute,
        this.options.message ?? "is not included in the list"
      );
    }
  }
}
