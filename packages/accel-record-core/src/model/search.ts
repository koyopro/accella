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
    const result = key.match(
      /^(.+?)_(((does_)?not_)?(eq|in|cont|start|end|null|match(es)?|lt|lte|gt|gte|true|false|blank|present)(_all|_any)?)$/
    );
    if (!result) return relation;
    const [name, predicate] = result.slice(1);
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
    predicate: string,
    value: any
  ) {
    let not = false;
    let all = false;
    let any = false;
    if (predicate.startsWith("not_")) {
      predicate = predicate.substring(4);
      not = true;
    }
    if (predicate.startsWith("does_not_")) {
      predicate = predicate.substring(9);
      not = true;
    }
    if (predicate.endsWith("_all")) {
      predicate = predicate.substring(0, predicate.length - 4);
      all = true;
    }
    if (predicate.endsWith("_any")) {
      predicate = predicate.substring(0, predicate.length - 4);
      any = true;
    }
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
      default: {
        let ret = relation;
        const values = [value].flat();
        if (all) {
          for (const v of [value].flat()) {
            const w = this.buildWhere(this.model, attrStr, predicate, v);
            const method = not ? "whereNot" : "where";
            ret = ret.joins(w.joins)[method](w.where);
          }
        } else if (any) {
          const method = not ? "whereNot" : "where";
          const w = this.buildWhere(this.model, attrStr, predicate, values[0]);
          let r = this.model.joins(w.joins)[method](w.where);
          for (const v of values.slice(1)) {
            const w = this.buildWhere(this.model, attrStr, predicate, v);
            r = r.or(this.model[method](w.where));
          }
          return relation.merge(r);
        } else {
          const w = this.buildWhere(this.model, attrStr, predicate, value);
          const method = not ? "whereNot" : "where";
          ret = relation.joins(w.joins)[method](w.where);
        }
        return ret;
      }
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
    case "match":
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
