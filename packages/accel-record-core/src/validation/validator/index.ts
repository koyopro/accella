import { Validations } from "../../model/validations.js";
import { Errors } from "../errors.js";

/**
 * Abstract class representing a validator for a specific type of record.
 * @template T - The type of record being validated.
 */
export abstract class Validator<T> {
  constructor(protected record: T & Validations) {}

  /**
   * Gets the errors associated with the record being validated.
   * @returns An object representing the errors.
   */
  get errors(): Errors {
    return this.record.errors;
  }

  /**
   * Validates the record.
   */
  abstract validate(): void;
}

export type DefualtOptions = {
  message?: string;
};
