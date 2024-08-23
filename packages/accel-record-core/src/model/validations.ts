import { Collection } from "../associations/collectionProxy.js";
import { HasManyAssociation } from "../associations/hasManyAssociation.js";
import { HasOneAssociation } from "../associations/hasOneAssociation.js";
import { Model } from "../index.js";
import { Meta } from "../meta.js";
import { Errors } from "../validation/errors.js";
import { AcceptanceOptions, AcceptanceValidator } from "../validation/validator/acceptance.js";
import { FormatOptions, FormatValidator } from "../validation/validator/format.js";
import { InclusionOptions, InclusionValidator } from "../validation/validator/inclusion.js";
import { Validator } from "../validation/validator/index.js";
import { LengthOptions, LengthValidator } from "../validation/validator/length.js";
import { PresenceOptions, PresenceValidator } from "../validation/validator/presence.js";
import { UniquenessValidator, UniqunessOptions } from "../validation/validator/uniqueness.js";

type ValidatesOptions<T> = {
  acceptance?: AcceptanceOptions;
  presence?: PresenceOptions;
  length?: LengthOptions;
  inclusion?: InclusionOptions;
  format?: FormatOptions;
  uniqueness?: UniqunessOptions<T>;
};

/**
 * Represents a class that provides validation functionality for models.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Validations {
  private _errors: Errors | undefined;

  get errors() {
    return (this._errors ||= new Errors(this as any));
  }

  /**
   * Checks if the model is valid by performing attribute and association validations.
   * @returns A boolean indicating whether the model is valid or not.
   */
  isValid<T extends Model>(this: T): boolean {
    this.runBeforeCallbacks("validation");
    this.errors.clearAll();
    this.validateAttributes();
    this.validateAssociations();
    this.runAfterCallbacks("validation");
    return this.errors.isEmpty();
  }

  private validateAssociations<T extends Model>(this: T) {
    for (const [key, association] of this.associations) {
      if (association instanceof HasOneAssociation) {
        if (association.isValid() === false) {
          this.errors.add(key, "is invalid");
        }
      }
      if (association instanceof HasManyAssociation && this[key as keyof T] instanceof Collection) {
        const value = this[key as keyof T];
        if (value instanceof Collection && value.isValid() === false) {
          this.errors.add(key, "is invalid");
        }
      }
    }
  }

  /**
   * Checks if the model is invalid by negating the result of the `isValid` method.
   * @returns A boolean indicating whether the model is invalid or not.
   */
  isInvalid<T extends Model>(this: T): boolean {
    return !this.isValid();
  }

  /**
   * Validates the model by calling the `isValid` method.
   * @returns A boolean indicating whether the model is valid or not.
   */
  validate<T extends Model>(this: T): boolean {
    return this.isValid();
  }

  /**
   * Validates the attributes of the model.
   * This method can be overridden in derived classes to provide custom attribute validations.
   */
  validateAttributes(): void {
    // override this method
  }

  /**
   * Performs validation using the specified validator.
   * @param validator - The validator to use for validation.
   */
  validatesWith(validator: Validator<unknown>): void {
    validator.validate();
  }

  /**
   * Performs validations on the specified attribute(s) of the model.
   * @param attribute - The attribute(s) to validate.
   * @param options - The validation options.
   */
  validates<T extends Model, K extends keyof Meta<T>["CreateInput"] & keyof T & string>(
    this: T,
    attribute: K | K[],
    options: ValidatesOptions<T>
  ): void {
    const attributes = Array.isArray(attribute) ? attribute : [attribute];
    for (const attribute of attributes as (keyof T & string)[]) {
      const value = this[attribute] as any;

      if (options.acceptance)
        new AcceptanceValidator(this, attribute, options.acceptance).validate();

      if (options.presence) new PresenceValidator(this, attribute, options.presence).validate();

      if (options.length && value != undefined)
        new LengthValidator(this, attribute, options.length).validate();

      if (options.inclusion && value != undefined)
        new InclusionValidator(this, attribute, options.inclusion).validate();

      if (options.format && value != undefined)
        new FormatValidator(this, attribute, options.format).validate();

      if (options.uniqueness)
        new UniquenessValidator(this, attribute, options.uniqueness).validate();
    }
  }
}
