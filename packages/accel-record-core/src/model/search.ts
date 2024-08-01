import { Model, Relation } from "../index.js";

export class Searchable {
  static search<T extends typeof Model>(
    this: T,
    params: Record<string, number | string>
  ) {
    return new Search(this, params);
  }
}

export class Search {
  constructor(
    protected model: typeof Model,
    protected params: Record<string, number | string>
  ) {}

  result() {
    let relation = this.model.all();
    for (const [key, value] of Object.entries(this.params)) {
      relation = this.updateRelation(relation, key, value);
    }
    return relation;
  }

  private updateRelation(
    relation: Relation<any, any>,
    key: string,
    value: any
  ) {
    const [name, predicate] = splitFromLast(key, "_");
    const attrs = name.split("_or_");
    if (attrs.length > 1) {
      let r = this.buildRelation(attrs[0], predicate, value);
      for (const attr of attrs.slice(1)) {
        r = r.or(this.buildRelation(attr, predicate, value));
      }
      return relation.merge(r);
    }
    const attr = attrs[0];
    switch (predicate) {
      case "eq":
        return relation.where({ [attr]: value });
      case "cont":
        return relation.where({ [attr]: { contains: value } });
    }
    return relation;
  }

  private buildRelation(attr: string, predicate: any, value: any) {
    const relation = this.model.all();
    switch (predicate) {
      case "eq":
        return relation.where({ [attr]: value });
      case "cont":
        return relation.where({ [attr]: { contains: value } });
    }
    return relation;
  }
}

function splitFromLast(str: string, delimiter: string): [string, string] {
  const lastIndex = str.lastIndexOf(delimiter);
  if (lastIndex === -1) return [str, ""];
  const name = str.substring(0, lastIndex);
  const predicate = str.substring(lastIndex + 1);
  return [name, predicate];
}
