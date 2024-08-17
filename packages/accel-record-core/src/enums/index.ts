export class Attribute {
  values: Value[];

  constructor(
    protected klass: any,
    protected name: string,
    protected enums: object
  ) {
    this.values = Object.keys(this.enums).map((key) => new Value(this, key));
  }

  options() {
    return this.values.map((v) => [v.value, v.text]);
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
    return this.name;
  }
}
