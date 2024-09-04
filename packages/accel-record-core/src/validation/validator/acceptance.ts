import { Validations } from "../../model/validations.js";
import { DefualtOptions, Validator } from "./index.js";

export type AcceptanceOptions = (
  | boolean
  | {
      accept: any | any[];
    }
) &
  DefualtOptions;

export class AcceptanceValidator<T extends Validations> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: AcceptanceOptions
  ) {
    super(record);
  }
  validate() {
    const accept = (typeof this.options === "object"
      ? [this.options.accept].flat()
      : undefined) ?? [true, "1"];
    if (!accept.includes(this.record[this.attribute] as any)) {
      this.errors.add(this.attribute, this.options.message ?? "accepted");
    }
  }
}
