import { Validations } from "../../model/validations.js";
import { DefualtOptions, Validator } from "./index.js";

/**
 * Options for numericality validation.
 */
export type NumericalityOptions = {
  /**
   * Validates that the value is of type Number.
   *
   * The message key is `notANumber`. The default message is `is not a number`.
   */
  onlyNumeric?: boolean;
  /**
   * Validates that the value is an integer.
   *
   * The message key is `notAnInteger`. The default message is `must be an integer`.
   */
  onlyInteger?: boolean;
  /**
   * Validates that the value is equal to the specified number.
   *
   * The message key is `equalTo`. The default message is `must be equal to {{count}}`.
   */
  equalTo?: number;
  /**
   * Validates that the value is greater than the specified number.
   *
   * The message key is `greaterThan`. The default message is `must be greater than {{count}}`.
   */
  greaterThan?: number;
  /**
   * Validates that the value is greater than or equal to the specified number.
   *
   * The message key is `greaterThanOrEqualTo`. The default message is `must be greater than or equal to {{count}}`.
   */
  greaterThanOrEqualTo?: number;
  /**
   * Validates that the value is less than the specified number.
   *
   * The message key is `lessThan`. The default message is `must be less than {{count}}`.
   */
  lessThan?: number;
  /**
   * Validates that the value is less than or equal to the specified number.
   *
   * The message key is `lessThanOrEqualTo`. The default message is `must be less than or equal to {{count}}`.
   */
  lessThanOrEqualTo?: number;
  /**
   * Validates that the value is between the specified numbers.
   *
   * The message key is `between`. The default message is `must be between {{min}} and {{max}}`.
   */
  between?: [number, number];
  /**
   * Validates that the value is other than the specified number.
   *
   * The message key is `otherThan`. The default message is `must be other than {{count}}`.
   */
  otherThan?: number;
  /**
   * Validates that the value is odd.
   *
   * The message key is `odd`. The default message is `must be odd`.
   */
  odd?: boolean;
  /**
   * Validates that the value is even.
   *
   * The message key is `even`. The default message is `must be even`.
   */
  even?: boolean;
  /**
   * Allows the value to be undefined.
   * The default value is `false`.
   */
  allowBlank?: boolean;
} & DefualtOptions;

export class NumericalityValidator<T extends Validations> extends Validator<T> {
  constructor(
    record: T,
    private attribute: keyof T & string,
    private options: NumericalityOptions
  ) {
    super(record);
  }
  validate() {
    const value = this.record[this.attribute];
    if (this.options.allowBlank && value == undefined) return;

    this.validateNumeric(value);

    const num = Number(value);
    this.validateInteger(num);
    this.validateFiniteNumber(num);

    this.validateEqualTo(num);
    this.validateOtherThan(num);

    this.validateGreaterThan(num);
    this.validateGreaterThanOrEqualTo(num);

    this.validateLessThan(num);
    this.validateLessThanOrEqualTo(num);

    this.validateBetween(num);

    this.validateOdd(num);
    this.validateEven(num);
  }

  private validateFiniteNumber(value: number) {
    if (Number.isFinite(value) === false) {
      this.errors.add(this.attribute, this.options.message ?? "notANumber");
    }
  }

  private validateEven(value: number) {
    if (this.options.even === true && value % 2 !== 0) {
      this.errors.add(this.attribute, this.options.message ?? "even");
    }
  }

  private validateOdd(value: number) {
    if (this.options.odd === true && value % 2 === 0) {
      this.errors.add(this.attribute, this.options.message ?? "odd");
    }
  }

  private validateEqualTo(value: number) {
    if (this.options.equalTo != undefined && value !== this.options.equalTo) {
      this.errors.add(this.attribute, this.options.message ?? "equalTo", {
        count: this.options.equalTo,
      });
    }
  }

  private validateInteger(value: number) {
    if (this.options.onlyInteger === true && Number.isInteger(value) === false) {
      this.errors.add(this.attribute, this.options.message ?? "notAnInteger");
    }
  }

  private validateNumeric(value: any) {
    if (this.options.onlyNumeric === true && Number.isFinite(value) === false) {
      this.errors.add(this.attribute, this.options.message ?? "notANumber");
    }
  }

  private validateOtherThan(value: number) {
    if (this.options.otherThan != undefined && value === this.options.otherThan) {
      this.errors.add(this.attribute, this.options.message ?? "otherThan", {
        count: this.options.otherThan,
      });
    }
  }

  private validateLessThan(value: number) {
    if (this.options.lessThan != undefined && value >= this.options.lessThan) {
      this.errors.add(this.attribute, this.options.message ?? "lessThan", {
        count: this.options.lessThan,
      });
    }
  }

  private validateLessThanOrEqualTo(value: number) {
    if (this.options.lessThanOrEqualTo != undefined && value > this.options.lessThanOrEqualTo) {
      this.errors.add(this.attribute, this.options.message ?? "lessThanOrEqualTo", {
        count: this.options.lessThanOrEqualTo,
      });
    }
  }

  private validateGreaterThan(value: number) {
    if (this.options.greaterThan != undefined && value <= this.options.greaterThan) {
      this.errors.add(this.attribute, this.options.message ?? "greaterThan", {
        count: this.options.greaterThan,
      });
    }
  }

  private validateGreaterThanOrEqualTo(value: number) {
    if (
      this.options.greaterThanOrEqualTo != undefined &&
      value < this.options.greaterThanOrEqualTo
    ) {
      this.errors.add(this.attribute, this.options.message ?? "greaterThanOrEqualTo", {
        count: this.options.greaterThanOrEqualTo,
      });
    }
  }

  private validateBetween(num: number) {
    if (this.options.between != undefined) {
      const [min, max] = this.options.between;
      if (num < min || max < num) {
        this.errors.add(this.attribute, this.options.message ?? "between", {
          min,
          max,
        });
      }
    }
  }
}
