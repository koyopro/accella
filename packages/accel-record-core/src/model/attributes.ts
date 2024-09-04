import { isBlank } from "../validation/validator/presence.js";

export class Attributes {
  /**
   * Transforms the attribute properties of the current object.
   */
  protected transformAttributeProperties() {
    for (const key of Object.getOwnPropertyNames(this) as (keyof this)[]) {
      if (this[key] instanceof AttributeType) {
        const type = this[key];
        Object.defineProperty(this, key, {
          get() {
            return type.value;
          },
          set(newValue) {
            type.value = newValue;
          },
        });
      }
    }
  }
}

export class AttributeType<T> {
  private _value: T | undefined;

  constructor(value: any) {
    this.value = value;
  }

  get value() {
    return this._value;
  }

  set value(value: any) {
    this._value = this.cast(value);
  }

  cast(value: any): T | undefined {
    return value;
  }
}

/**
 * Represents an integer type attribute.
 */
export class IntegerType extends AttributeType<number> {
  cast(value: any): number | undefined {
    if (isBlank(value)) return undefined;
    const num = Number.parseInt(value);
    return Number.isInteger(num) ? num : undefined;
  }
}

/**
 * Represents a float type attribute.
 */
export class FloatType extends AttributeType<number> {
  cast(value: any): number | undefined {
    if (isBlank(value)) return undefined;
    const num = Number.parseFloat(value);
    return Number.isFinite(num) ? num : undefined;
  }
}

/**
 * Represents a string type attribute.
 */
export class StringType extends AttributeType<string> {
  cast(value: any): string | undefined {
    if (value == undefined) return undefined;
    return String(value);
  }
}

/**
 * Represents a boolean type attribute.
 */
export class BooleanType extends AttributeType<boolean> {
  cast(value: any): boolean | undefined {
    if (isBlank(value)) return undefined;
    const falseValues = [false, 0, "0", "f", "F", "false", "FALSE", "off", "OFF"];
    return !falseValues.includes(value);
  }
}

/**
 * Represents a date type attribute.
 */
export class DateType extends AttributeType<Date> {
  cast(value: any): Date | undefined {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
}

/**
 * Create an integer attribute.
 */
export const integerAttribute = (value: any = undefined): number | undefined =>
  new IntegerType(value) as any;

/**
 * Create a float attribute.
 */
export const floatAttribute = (value: any = undefined): number | undefined =>
  new FloatType(value) as any;

/**
 * Create a string attribute.
 */
export const stringAttribute = (value: any = undefined): string | undefined =>
  new StringType(value) as any;

/**
 * Create a boolean attribute.
 */
export const booleanAttribute = (value: any = undefined): boolean | undefined =>
  new BooleanType(value) as any;

/**
 * Create a date attribute.
 */
export const dateAttribute = (value: any = undefined): Date | undefined =>
  new DateType(value) as any;

export const attributes = {
  /**
   * Represents an integer attribute.
   *
   * @example
   * class MyForm extends FormModel {
   *   count = attributes.integer(0);
   * }
   */
  integer: integerAttribute,
  /**
   * Represents a float attribute.
   *
   * @example
   * class MyForm extends FormModel {
   *   ratio = attributes.float(0.5);
   * }
   */
  float: floatAttribute,
  /**
   * Represents a string attribute.
   *
   * @example
   * class MyForm extends FormModel {
   *   text = attributes.string("abc");
   * }
   */
  string: stringAttribute,
  /**
   * Represents a boolean attribute.
   *
   * @example
   * class MyForm extends FormModel {
   *   enabled = attributes.boolean(false);
   * }
   */
  boolean: booleanAttribute,
  /**
   * Represents a date attribute.
   *
   * @example
   * class MyForm extends FormModel {
   *   date = attributes.date(new Date());
   * }
   */
  date: dateAttribute,
};
