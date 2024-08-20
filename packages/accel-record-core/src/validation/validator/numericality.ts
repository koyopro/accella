import { Model } from "../../index.js";
import { DefualtOptions, Validator } from "./index.js";

export type NumericalityOptions = {
  onlyNumeric?: boolean;
  onlyInteger?: boolean;
  equalTo?: number;
  greaterThan?: number;
  greaterThanOrEqualTo?: number;
  lessThan?: number;
  lessThanOrEqualTo?: number;
  otherThan?: number;
  odd?: boolean;
  even?: boolean;
  allowBlank?: boolean;
} & DefualtOptions;

export class NumericalityValidator<T extends Model> extends Validator<T> {
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
    if (
      this.options.onlyInteger === true &&
      Number.isInteger(value) === false
    ) {
      this.errors.add(this.attribute, this.options.message ?? "notAnInteger");
    }
  }

  private validateNumeric(value: any) {
    if (this.options.onlyNumeric === true && Number.isFinite(value) === false) {
      this.errors.add(this.attribute, this.options.message ?? "notANumber");
    }
  }

  private validateOtherThan(value: number) {
    if (
      this.options.otherThan != undefined &&
      value === this.options.otherThan
    ) {
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
    if (
      this.options.lessThanOrEqualTo != undefined &&
      value > this.options.lessThanOrEqualTo
    ) {
      this.errors.add(
        this.attribute,
        this.options.message ?? "lessThanOrEqualTo",
        {
          count: this.options.lessThanOrEqualTo,
        }
      );
    }
  }

  private validateGreaterThan(value: number) {
    if (
      this.options.greaterThan != undefined &&
      value <= this.options.greaterThan
    ) {
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
      this.errors.add(
        this.attribute,
        this.options.message ?? "greaterThanOrEqualTo",
        {
          count: this.options.greaterThanOrEqualTo,
        }
      );
    }
  }
}
