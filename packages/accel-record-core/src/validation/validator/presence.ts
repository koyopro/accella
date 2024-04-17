import { Collection } from "../../associations/collectionProxy.js";
import { Model } from "../../index.js";
import { DefualtOptions, Validator } from "./index.js";

export type PresenceOptions = boolean & DefualtOptions;

export class PresenceValidator<T extends Model> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: PresenceOptions
  ) {
    super(record);
  }
  validate() {
    if (this.options && isBlank(this.record[this.attribute])) {
      this.errors.add(this.attribute, this.options.message ?? "can't be blank");
    }
  }
}
const isBlank = (value: any) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (Array.isArray(value) || value instanceof Collection) {
    return value.length === 0;
  }
  return value == undefined;
};
