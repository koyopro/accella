import { Model } from "../index.js";
import { i18n } from "../model/naming.js";

export class Attribute {
  values: Value[];

  constructor(
    public klass: any,
    public name: string,
    protected enums: object
  ) {
    this.values = Object.keys(this.enums).map((key) => new Value(this, key));
  }

  options() {
    return this.values.map((v) => [v.text, v.value]);
  }
}

export class Value {
  value: string;

  constructor(
    protected attribute: Attribute,
    protected name: string
  ) {
    this.value = name;
  }

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

export const defineEnumTextAttribute = (
  base: typeof Model,
  persisted: any,
  name: string
) => {
  Object.defineProperty(base.prototype, `${name}Text`, {
    get() {
      return persisted[name].values.find((v: Value) => v.value == this[name])
        ?.text;
    },
  });
};
