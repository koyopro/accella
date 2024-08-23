import { Model } from "../index.js";
import { Relation } from "../relation/index.js";
import { getCondition } from "./condition.js";
import { Predicate, Query } from "./query.js";

export class RelationUpdater {
  constructor(
    protected model: typeof Model,
    protected relation: Relation<any, any>,
    protected key: string,
    protected value: any
  ) {}

  update() {
    const { relation, key, value } = this;
    if (this.model.searchableScopes.includes(key)) {
      return this.relation.merge((this.model as any)[key](value));
    }
    const q = new Query(key, value);
    if (!q.isValid) return relation;

    const { predicate, orList } = q;
    if (orList.length > 1) {
      const tmp = orList.reduce((acc: Relation<any, any> | undefined, attr) => {
        const r = this.affectQuery(this.model.all(), attr, predicate);
        return acc?.or(r) ?? r;
      }, undefined);
      return relation.merge(tmp!);
    }
    let ret = relation;
    for (const attr of q.attributes) {
      ret = this.affectQuery(ret, attr, predicate);
    }
    return ret;
  }

  private affectQuery(relation: Relation<any, any>, attrStr: string, predicate: Predicate) {
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
        return this.affectDefaultQuery(relation, attrStr, predicate);
    }
  }

  private affectDefaultQuery(relation: Relation<any, any>, attrStr: string, predicate: Predicate) {
    const values = [this.value].flat();
    switch (predicate.type) {
      case "all":
        return this.buildAllWhere(relation, values, attrStr, predicate);

      case "any":
        return this.buildAnyWhere(relation, values, attrStr, predicate);

      default: {
        const method = predicate.not ? "whereNot" : "where";
        const w = this.buildWhere(this.model, attrStr, predicate, this.value);
        return relation.joins(w.joins)[method](w.where);
      }
    }
  }

  private buildAnyWhere(
    relation: Relation<any, any>,
    values: any[],
    attrStr: string,
    predicate: Predicate
  ) {
    const method = predicate.not ? "whereNot" : "where";
    const tmp = values.reduce((acc: Relation<any, any> | undefined, v) => {
      const w = this.buildWhere(this.model, attrStr, predicate, v);
      const r = this.model[method](w.where);
      return acc?.or(r) ?? r.joins(w.joins);
    }, undefined);
    return relation.merge(tmp);
  }

  private buildAllWhere(
    relation: Relation<any, any>,
    values: any[],
    attrStr: string,
    predicate: Predicate
  ) {
    const method = predicate.not ? "whereNot" : "where";
    let ret = relation;
    for (const v of values) {
      const w = this.buildWhere(this.model, attrStr, predicate, v);
      ret = ret.joins(w.joins)[method](w.where);
    }
    return ret;
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
