import { a } from "vitest/dist/suite-xGC-mxBC.js";
import { Model, Relation } from "../index.js";

export class Searchable {
  static search<T extends typeof Model>(
    this: T,
    params: Record<string, number | string>
  ) {
    return new Search(this, params);
  }

  static searchableScopes: string[] = [];
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
    if (this.model.searchableScopes.includes(key)) {
      return relation.merge((this.model as any)[key](value));
    }
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
    attrStr: string,
    predicate: any,
    value: any
  ) {
    switch (predicate) {
      case "blank": {
        const w1 = this.buildWhere(this.model, attrStr, predicate, "");
        const w2 = this.buildWhere(this.model, attrStr, predicate, null);
        return relation.joins(w1.joins).where(w1.where).or(w2.where);
      }
      case "present": {
        const w1 = this.buildWhere(this.model, attrStr, predicate, "");
        const w2 = this.buildWhere(this.model, attrStr, predicate, null);
        return relation.joins(w1.joins).whereNot(w1.where).whereNot(w2.where);
      }
      default:
        const w = this.buildWhere(this.model, attrStr, predicate, value);
        return relation.joins(w.joins).where(w.where);
    }
  }

  private buildWhere(
    model: typeof Model,
    attrStr: string,
    predicate: string,
    value: any
  ): { where: object; joins: object } {
    const field = model.findField(attrStr);
    if (!field) {
      for (const [key, association] of Object.entries(model.associations)) {
        if (attrStr.startsWith(`${key}_`)) {
          const nextAttr = attrStr.substring(key.length + 1);
          const next = this.buildWhere(
            association.model,
            nextAttr,
            predicate,
            value
          );
          const where = { [key]: next.where };
          const joins = { [key]: next.joins };
          return { where, joins };
        }
      }
    }
    const where = {
      [attrStr]: getCondition(predicate, value),
    };
    const joins = {};
    return { where, joins };
  }
}

function splitFromLast(str: string, delimiter: string): [string, string] {
  const lastIndex = str.lastIndexOf(delimiter);
  if (lastIndex === -1) return [str, ""];
  const name = str.substring(0, lastIndex);
  const predicate = str.substring(lastIndex + 1);
  return [name, predicate];
}

const getCondition = (predicate: string, value: any) => {
  switch (predicate) {
    case "eq":
      return value;
    case "cont":
      return { contains: value };
    case "start":
      return { startsWith: value };
    case "end":
      return { endsWith: value };
    case "matches":
      return { like: value };
    case "lt":
      return { "<": value };
    case "lte":
      return { "<=": value };
    case "gt":
      return { ">": value };
    case "gte":
      return { ">=": value };
    case "in":
      return { in: value };
    case "true":
      return true;
    case "false":
      return false;
    case "null":
      return null;
    default:
      // unknown predicate
      return value;
  }
};
