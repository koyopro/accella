import { Errors } from "../errors.js";

export abstract class Validator {
  constructor(protected record: any) {}

  get errors(): Errors {
    return this.record.errors;
  }

  abstract validate(): void;
}

export type DefualtOptions = {
  message?: string;
};
