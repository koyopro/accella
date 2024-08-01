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
    const ors = name.split("_or_");
    if (ors.length > 1) {
      let r = this.buildRelation(this.model.all(), ors[0], predicate, value);
      for (const attr of ors.slice(1)) {
        r = r.or(this.buildRelation(this.model.all(), attr, predicate, value));
      }
      return relation.merge(r);
    }
    const attrs = name.split("_and_");
    for (const attr of attrs) {
      relation = this.buildRelation(relation, attr, predicate, value);
    }
    return relation;
  }

  private buildRelation(
    relation: Relation<any, any>,
    attr: string,
    predicate: any,
    value: any
  ) {
    switch (predicate) {
      case "eq":
        return relation.where({ [attr]: value });
      case "cont":
        return relation.where({ [attr]: { contains: value } });
      case "start":
        return relation.where({ [attr]: { startsWith: value } });
      case "end":
        return relation.where({ [attr]: { endsWith: value } });
      case "matches":
        return relation.where({ [attr]: { like: value } });
      case "lt":
        return relation.where({ [attr]: { "<": value } });
      case "lte":
        return relation.where({ [attr]: { "<=": value } });
      case "gt":
        return relation.where({ [attr]: { ">": value } });
      case "gte":
        return relation.where({ [attr]: { ">=": value } });
      case "in":
        return relation.where({ [attr]: { in: value } });
      case "true":
        return relation.where({ [attr]: true });
      case "false":
        return relation.where({ [attr]: false });
      case "null":
        return relation.where({ [attr]: null });
      case "blank":
        return relation.where({ [attr]: null }).or({ [attr]: "" });
      case "present":
        return relation.whereNot({ [attr]: null }).whereNot({ [attr]: "" });
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
