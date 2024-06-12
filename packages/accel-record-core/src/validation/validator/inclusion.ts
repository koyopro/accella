import { Model } from "../../index.js";
import { DefualtOptions, Validator } from "./index.js";

export type InclusionOptions = {
  in: any[];
} & DefualtOptions;

export class InclusionValidator<T extends Model> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: InclusionOptions
  ) {
    super(record);
  }
  validate() {
    if (!this.options.in.includes(this.record[this.attribute])) {
      this.errors.add(this.attribute, this.options.message ?? "inclusion");
    }
  }
}
