import { AttributeNotFound } from "../errors.js";
import { Model, Models, Relation } from "../index.js";
import { ModelMeta } from "../meta.js";
import { Relations } from "./index.js";

/**
 * Provides the *where* related methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Where {
  /**
   * Adds a WHERE clause to the query.
   *
   * @param input - An object representing the WHERE clause.
   * @returns A new instance of the Relation class with the WHERE clause added.
   */
  where<T, M extends ModelMeta>(
    this: Relations<T, M>,
    input: M["WhereInput"]
  ): Relation<T, M>;
  /**
   * Adds a WHERE clause to the query.
   *
   * @param query - The query string or an object representing the WHERE clause.
   * @param bindings - Optional bindings for the query.
   * @returns A new instance of the Relation class with the WHERE clause added.
   */
  where<T, M extends ModelMeta>(
    this: Relations<T, M>,
    query: string,
    ...bindings: any[]
  ): Relation<T, M>;
  where<T, M extends ModelMeta>(
    this: Relation<T, M>,
    queryOrInput: string | M["WhereInput"],
    ...bindings: any[]
  ): Relation<T, M> {
    if (typeof queryOrInput === "string") {
      return this.whereRaw(queryOrInput, ...bindings);
    }
    const input = queryOrInput;
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      const col = `${this.model.tableName}.${column}`;
      if (!column) {
        const associationWheres = this.getAssocationWhere(key, input[key]);
        if (associationWheres) {
          for (const where of associationWheres) {
            newOptions["wheres"].push(where);
          }
        } else {
          throw new AttributeNotFound(`Attribute not found: ${key}`);
        }
      } else if (Array.isArray(input[key])) {
        newOptions["wheres"].push([col, "in", input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push(
            makeWhere(col, operator, input[key][operator])
          );
        }
      } else {
        // In knex, we need to use null instead of undefined."
        const value = input[key] ?? null;
        newOptions["wheres"].push({ [col]: value });
      }
    }
    return new Relation(this.model, newOptions);
  }

  private getAssocationWhere<T, M extends ModelMeta>(
    this: Relation<T, M>,
    key: Extract<keyof M["WhereInput"], string>,
    value: any,
    op: string = "in"
  ) {
    const field = this.model.findField(key);
    if (field?.relationName == undefined) return;

    const records = [value].flat();
    if (records.length > 0 && !(records[0] instanceof Model)) {
      return Models[field.type].where(value).options.wheres;
    }

    const where: any = {};

    for (let i = 0; i < field.foreignKeys.length; i++) {
      const column = this.model.attributeToColumn(field.foreignKeys[i]);
      if (!column) return;
      where[column] ||= [];

      for (const record of records) {
        where[column].push(record[field.primaryKeys[i]]);
      }
    }

    return Object.entries(where).map(([column, values]) => [
      column,
      op,
      values,
    ]);
  }

  /**
   * Adds a "where not" condition to the current relation.
   *
   * @param input - The input object specifying the "where not" condition.
   * @returns A new instance of the Relation class with the added "where not" condition.
   */
  whereNot<T, M extends ModelMeta>(
    this: Relations<T, M>,
    input: M["WhereInput"]
  ): Relation<T, M>;
  whereNot<T, M extends ModelMeta>(
    this: Relation<T, M>,
    input: M["WhereInput"]
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      const col = `${this.model.tableName}.${column}`;
      if (!column) {
        const associationWheres = this.getAssocationWhere(
          key,
          input[key],
          "not in"
        );
        if (associationWheres) {
          for (const where of associationWheres) {
            if (Array.isArray(where) && where[1] === "not in") {
              newOptions["wheres"].push(where);
            } else {
              newOptions["whereNots"].push(where);
            }
          }
        } else {
          throw new Error(`Attribute not found: ${key}`);
        }
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["wheres"].push([col, "not in", input[key][operator]]);
          } else {
            newOptions["whereNots"].push(
              makeWhere(col, operator, input[key][operator])
            );
          }
        }
      } else {
        // In knex, we need to use null instead of undefined."
        const value = input[key] ?? null;
        newOptions["whereNots"].push({ [col]: value });
      }
    }
    return new Relation(this.model, newOptions);
  }

  /**
   * Adds a raw WHERE clause to the query.
   *
   * @param query - The raw SQL query string.
   * @param bindings - The parameter bindings for the query.
   * @returns A new `Relation` instance with the added WHERE clause.
   */
  whereRaw<T, M extends ModelMeta>(
    this: Relation<T, M>,
    query: string,
    ...bindings: any[]
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["whereRaws"].push([query, bindings]);
    return new Relation(this.model, newOptions);
  }

  /**
   * Combines the current relation with another relation using the OR operator.
   *
   * @param relation - The relation to combine with the current relation.
   * @returns A new relation that represents the combined result.
   */
  or<T, M extends ModelMeta>(
    this: Relation<T, M>,
    relation: Relation<T, M>
  ): Relation<T, M>;
  /**
   * Adds a condition to the current relation using the OR operator.
   *
   * @param input - An object representing the WHERE clause.
   * @returns A new relation with the added condition.
   */
  or<T, M extends ModelMeta>(
    this: Relation<T, M>,
    input: M["WhereInput"]
  ): Relation<T, M>;
  or<T, M extends ModelMeta>(
    this: Relation<T, M>,
    relationOrInput: Relation<T, M> | M["WhereInput"]
  ): Relation<T, M> {
    const relation: any =
      relationOrInput instanceof Relation
        ? relationOrInput
        : new Relation(this.model, {}).where(relationOrInput);
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["orWheres"].push(relation.options.wheres);
    newOptions["orWhereNots"].push(relation.options.whereNots);
    return new Relation(this.model, newOptions);
  }
}

const makeWhere = (key: string, operator: string, value: string) => {
  switch (operator) {
    case "startsWith":
      return [key, "like", `${value}%`];
    case "endsWith":
      return [key, "like", `%${value}`];
    case "contains":
      return [key, "like", `%${value}%`];
    default:
      return [key, operator, value];
  }
};
