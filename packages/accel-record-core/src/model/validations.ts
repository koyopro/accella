import { Model } from "../index.js";
import { Meta } from "../meta.js";
import { Errors } from "../validation/errors.js";
import {
  AcceptanceOptions,
  AcceptanceValidator,
} from "../validation/validator/acceptance.js";
import {
  FormatOptions,
  FormatValidator,
} from "../validation/validator/format.js";
import {
  InclusionOptions,
  InclusionValidator,
} from "../validation/validator/inclusion.js";
import { Validator } from "../validation/validator/index.js";
import {
  LengthOptions,
  LengthValidator,
} from "../validation/validator/length.js";
import {
  PresenceOptions,
  PresenceValidator,
} from "../validation/validator/presence.js";

type ValidatesOptions = {
  acceptance?: AcceptanceOptions;
  presence?: PresenceOptions;
  length?: LengthOptions;
  inclusion?: InclusionOptions;
  format?: FormatOptions;
};

export class Validations {
  errors = new Errors();

  isValid() {
    this.errors.clearAll();
    this.validateAttributes();
    return this.errors.isEmpty();
  }

  isInvalid() {
    return !this.isValid();
  }

  validate() {
    return this.isValid();
  }

  validateAttributes() {
    // override this method
  }

  validatesWith(validator: Validator<unknown>) {
    validator.validate();
  }

  validates<
    T extends Model,
    K extends keyof Meta<T>["CreateInput"] & keyof T & string,
  >(this: T, attribute: K | K[], options: ValidatesOptions) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute];
    for (const attribute of attributes as (keyof T & string)[]) {
      const value = this[attribute] as any;
      if (options.acceptance) {
        new AcceptanceValidator(this, attribute, options.acceptance).validate();
      }
      if (options.presence) {
        new PresenceValidator(this, attribute, options.presence).validate();
      }
      if (options.length && value != undefined) {
        new LengthValidator(this, attribute, options.length).validate();
      }
      if (options.inclusion && value != undefined) {
        new InclusionValidator(this, attribute, options.inclusion).validate();
      }
      if (options.format && value != undefined) {
        new FormatValidator(this, attribute, options.format).validate();
      }
    }
  }
}
