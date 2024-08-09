export class Predicate {
  name: string = "";
  not = false;
  type: "all" | "any" | undefined;

  constructor(protected key: string) {
    let name = key;
    if (name.startsWith("not_")) {
      name = name.substring(4);
      this.not = true;
    }
    if (name.startsWith("does_not_")) {
      name = name.substring(9);
      this.not = true;
    }
    if (name.endsWith("_all")) {
      name = name.substring(0, name.length - 4);
      this.type = "all";
    } else if (name.endsWith("_any")) {
      name = name.substring(0, name.length - 4);
      this.type = "any";
    }
    this.name = name;
  }
}

export class Query {
  name: string = "";
  predicate: Predicate = new Predicate("");

  constructor(
    protected key: string,
    protected value: any
  ) {
    const parsed = key.match(
      /^(.+?)_(((does_)?not_)?(eq|in|cont|start|end|null|match(es)?|lt|lte|gt|gte|true|false|blank|present)(_all|_any)?)$/
    );
    if (!parsed) return;
    this.name = parsed[1];
    this.predicate = new Predicate(parsed[2]);
  }

  get isValid() {
    return this.name !== "" && this.predicate.name !== "";
  }

  get orList() {
    return this.name.split("_or_");
  }

  get attributes() {
    return this.name.split("_and_");
  }
}
