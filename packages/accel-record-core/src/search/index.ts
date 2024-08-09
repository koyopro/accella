import { AttributeNotFound } from "../errors.js";
import type { Model } from "../index.js";
import type { Relation } from "../relation/index.js";
import { getCondition } from "./condition.js";
import { Predicate, Query } from "./query.js";

export class Search {
  constructor(
    protected model: typeof Model,
    protected params: Record<string, number | string>,
    protected relation: Relation<any, any> | undefined = undefined
  ) {}

  /**
   * Retrieves the search result based on the specified parameters.
   */
  result() {
    let relation = this.relation ?? this.model.all();
    for (const [key, value] of Object.entries(this.params)) {
      try {
        relation = this.updateRelation(relation, key, value);
      } catch (e) {
        if (e instanceof AttributeNotFound) {
          // Ignore the error
        } else throw e;
      }
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
    const q = new Query(key, value);
    if (!q.isValid) return relation;

    const { predicate, orList } = q;
    if (orList.length > 1) {
      let tmp = orList.reduce((acc: Relation<any, any> | undefined, attr) => {
        const r = this.affectQuery(this.model.all(), attr, predicate, value);
        return acc?.or(r) ?? r;
      }, undefined);
      return relation.merge(tmp!);
    }
    for (const attr of q.attributes) {
      relation = this.affectQuery(relation, attr, predicate, value);
    }
    return relation;
  }

  private affectQuery(
    relation: Relation<any, any>,
    attrStr: string,
    predicate: Predicate,
    value: any
  ) {
    switch (predicate.name) {
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
        return this.affectDefaultQuery(relation, attrStr, predicate, value);
    }
  }

  private affectDefaultQuery(
    relation: Relation<any, any>,
    attrStr: string,
    predicate: Predicate,
    value: any
  ) {
    const method = predicate.not ? "whereNot" : "where";
    const values = [value].flat();
    switch (predicate.type) {
      case "all": {
        let ret = relation;
        for (const v of values) {
          const w = this.buildWhere(this.model, attrStr, predicate, v);
          ret = ret.joins(w.joins)[method](w.where);
        }
        return ret;
      }
      case "any": {
        let tmp = values.reduce((acc: Relation<any, any> | undefined, v) => {
          const w = this.buildWhere(this.model, attrStr, predicate, v);
          const r = this.model[method](w.where);
          return acc?.or(r) ?? r.joins(w.joins);
        }, undefined);
        return relation.merge(tmp);
      }
      default: {
        const w = this.buildWhere(this.model, attrStr, predicate, value);
        return relation.joins(w.joins)[method](w.where);
      }
    }
  }

  private buildWhere(
    model: typeof Model,
    attrStr: string,
    predicate: Predicate,
    value: any
  ): { where: object; joins: object } {
    const field = model.findField(attrStr);
    if (!field) {
      for (const [key, association] of Object.entries(model.associations)) {
        if (attrStr.startsWith(`${key}_`)) {
          const nextAttr = attrStr.substring(key.length + 1);
          const { model: nextModel } = association;
          const next = this.buildWhere(nextModel, nextAttr, predicate, value);
          return {
            where: { [key]: next.where },
            joins: { [key]: next.joins },
          };
        }
      }
    }
    return {
      where: { [attrStr]: getCondition(predicate.name, value) },
      joins: {},
    };
  }
}
