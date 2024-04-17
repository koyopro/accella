import { Model } from "../../index.js";
import { Errors } from "../errors.js";

export abstract class Validator<T> {
  constructor(protected record: T & Model) {}

  get errors(): Errors {
    return this.record.errors;
  }

  abstract validate(): void;
}

export type DefualtOptions = {
  message?: string;
};
