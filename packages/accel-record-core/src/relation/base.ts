import { Knex } from "knex";
import { exec } from "../database.js";
import { ModelMeta } from "../meta.js";
import { affectLock } from "../model/lock.js";
import { IncludesLoader } from "./includes.js";
import { Relation } from "./index.js";
import { Condition, Options } from "./options.js";

/**
 * Provides the base methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class RelationBase {
  reset<T>(this: Relation<T, ModelMeta>) {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }

  setOption<T>(this: Relation<T, ModelMeta>, key: keyof Options, value: any) {
    (this.options as any)[key] = value;
    return this;
  }

  copyOptions<T>(this: Relation<T, ModelMeta>) {
    return JSON.parse(JSON.stringify(this.options));
  }

  load<T, M extends ModelMeta>(this: Relation<T, M>): T[] {
    const select =
      this.options.select.length > 0
        ? this.options.select.map(
            (column) => `${this.model.tableName}.${this.model.attributeToColumn(column)}`
          )
        : [`${this.model.tableName}.*`];
    const rows = exec(this.query().select(...select));
    for (const association of this.options.includes ?? []) {
      new IncludesLoader(this.model, rows, association).load();
    }
    const records = rows.map((row: object) => this.makeAttributes(row));
    if (this.options.select.length > 0) return records;
    return records.map((record: object) => {
      const obj = this.model.build(record);
      obj.isNewRecord = false;
      return obj;
    });
  }
  /**
   * Returns the query builder instance with all the specified where conditions and other options applied.
   * @returns The query builder instance.
   */
  get queryBuilder(): Knex.QueryBuilder {
    return (this as any).query();
  }

  protected query<T>(this: Relation<T, ModelMeta>) {
    let q = this.model.queryBuilder.clone() as any;
    for (const join of this.options.joins) {
      q = q.join(join[0], function (this: any) {
        for (const j of join[1]) this.on(...j);
      });
    }
    for (const [query, bindings] of this.options.joinsRaw) {
      q = q.joinRaw(query, bindings);
    }
    for (const condition of this.options.conditions) {
      q = affectCondition(condition, q);
    }
    if (this.options.limit) q = q.limit(this.options.limit);
    if (this.options.offset) q = q.offset(this.options.offset);
    for (const [column, direction] of this.options.orders ?? []) {
      q = q.orderBy(column, direction);
    }
    q = affectLock(q, this.options.lock);
    return q;
  }
  protected makeAttributes<T>(this: Relation<T, ModelMeta>, row: object) {
    const attributes = {} as any;
    for (const [key, value] of Object.entries(row)) {
      const association = this.model.associations[key];
      if (association?.isHasOne) {
        attributes[key] = value[0];
        continue;
      }
      const attr = this.model.columnToAttribute(key);
      attributes[attr ?? key] = this.model.findField(key)?.cast(value) ?? value;
    }
    return attributes;
  }
}

const affectCondition = (condition: Condition, q: any) => {
  switch (condition.__op__) {
    case "hash":
      return q.where(condition.condition);
    case "hashNot":
      return q.whereNot(condition.condition);
    case "list":
      return q.where(...condition.condition);
    case "listNot":
      return q.whereNot(...condition.condition);
    case "raw":
      return q.whereRaw(condition.query, condition.bindings);
    case "and":
      for (const c of condition.conditions) {
        q.andWhere((builder: any) => affectCondition(c, builder));
      }
      return q;
    case "or":
      for (const c of condition.conditions) {
        q.orWhere((builder: any) => affectCondition(c, builder));
      }
      return q;
  }
};
