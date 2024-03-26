import { exec } from "../database.js";
import { ModelMeta, Models } from "../index.js";
import { Relation } from "./index.js";
import { Options } from "./options.js";

export class RelationBase {
  setOption(
    this: Relation<unknown, ModelMeta>,
    key: keyof Options,
    value: any
  ) {
    this.options[key] = value;
  }
  protected _get(this: Relation<unknown, ModelMeta>) {
    const select =
      this.options.select.length > 0
        ? this.options.select.map(
            (column) =>
              `${this.model.tableName}.${this.model.attributeToColumn(column)}`
          )
        : [`${this.model.tableName}.*`];
    const rows = exec(this.query().select(...select));
    this.loadIncludes(rows);
    const records = rows.map((row: object) => this.makeAttributes(row));
    if (this.options.select.length > 0) return records;
    return records.map((record: object) => {
      const obj = this.model.build(record);
      obj.isNewRecord = false;
      return obj;
    });
  }
  protected query(this: Relation<unknown, ModelMeta>) {
    let q = this.client.clone();
    for (const join of this.options.joins) {
      q = q.join(...join);
    }
    for (const where of this.options.wheres) {
      if (Array.isArray(where)) {
        q = q.where(...where);
      } else {
        q = q.where(where);
      }
    }
    for (const where of this.options.whereNots) {
      if (Array.isArray(where)) {
        q = q.whereNot(...where);
      } else {
        q = q.whereNot(where);
      }
    }
    for (const [query, bindings] of this.options.whereRaws) {
      q = q.whereRaw(query, bindings);
    }
    if (this.options.limit) q = q.limit(this.options.limit);
    if (this.options.offset) q = q.offset(this.options.offset);
    for (const [column, direction] of this.options.orders ?? []) {
      q = q.orderBy(column, direction);
    }
    return q;
  }
  protected loadIncludes(this: Relation<unknown, ModelMeta>, rows: any[]) {
    for (const association of this.options.includes ?? []) {
      if (association.isBelongsTo) {
        this.loadBelongsToIncludes(rows, association);
      } else {
        const { klass, name, primaryKey, foreignKey } = association;
        const primaryKeys = rows.map((row: any) => row[primaryKey]);
        const included = Models[klass].where({ [foreignKey]: primaryKeys });
        const mapping: any = {};
        for (const row of included) {
          (mapping[(row as any)[foreignKey]] ||= []).push(row);
        }
        for (const row of rows) {
          row[name] = mapping[row[primaryKey]] ?? [];
        }
      }
    }
  }
  protected loadBelongsToIncludes(
    rows: any[],
    association: Options["includes"][0]
  ) {
    const { klass, name, primaryKey, foreignKey } = association;
    const foreignKeys = rows.map((row: any) => row[foreignKey]);
    const mapping: any = {};
    const included = Models[klass].where({ [primaryKey]: foreignKeys });
    for (const row of included) {
      mapping[(row as any)[primaryKey]] = row;
    }
    for (const row of rows) {
      row[name] = mapping[row[foreignKey]];
    }
  }
  protected makeAttributes(this: Relation<unknown, ModelMeta>, row: object) {
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
