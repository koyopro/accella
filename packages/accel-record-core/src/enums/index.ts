import { Model } from "../index.js";
import { i18n } from "../model/naming.js";

/**
 * Represents an enum attribute.
 */
export class Attribute {
  protected _values: Value[];

  constructor(
    public klass: any,
    public name: string,
    protected enums: object
  ) {
    this._values = Object.keys(this.enums).map((key) => new Value(this, key));
  }

  /**
   * Returns the values of the enum.
   *
   * @returns An array containing the values of the enum.
   */
  values() {
    return this._values;
  }

  /**
   * Retrieves an array of options.
   * Each option is represented as an array with two elements: the localized text and value.
   *
   * @returns The array of options.
   */
  options(): [string, string][] {
    return this.values().map((v) => [v.text, v.value]);
  }
}

/**
 * Represents a value in an enumeration.
 */
export class Value {
  value: string;

  constructor(
    protected attribute: Attribute,
    protected name: string
  ) {
    this.value = name;
  }

  /**
   * Retrieves the localized text for the current enum value.
   *
   * The text is retrieved using the following keys in order:
   * - `enums.${klass}.${attribute}.${name}`
   * - `enums.defaults.${attribute}.${name}`
   * - `enums.${attribute}.${name}`
   *
   * If no localized text is found, the name of the enum value is returned.
   *
   * @returns The localized text for the enum value, or the name if no text is found.
   */
  get text() {
    const keys = [
      `enums.${this.attribute.klass.name}.${this.attribute.name}.${this.name}`,
      `enums.defaults.${this.attribute.name}.${this.name}`,
      `enums.${this.attribute.name}.${this.name}`,
    ];
    for (const key of keys) {
      const text = i18n?.t(key, "");
      if (text) return text;
    }
    return this.name;
  }
}

export const defineEnumTextAttribute = (base: typeof Model, persisted: any, name: string) => {
  const attr = `${name}Text`;
  if (!Object.getOwnPropertyDescriptor(base.prototype, attr)) {
    Object.defineProperty(base.prototype, attr, {
      get() {
        return (persisted[name] as Attribute).values().find((v) => v.value == this[name])?.text;
      },
    });
  }
};
