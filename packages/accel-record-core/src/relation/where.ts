import { Relation } from "../index.js";
import { ModelMeta } from "../meta.js";

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
    this: Relation<T, M>,
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
    this: Relation<T, M>,
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
      if (!column) throw new Error(`Attribute not found: ${key}`);
      if (Array.isArray(input[key])) {
        newOptions["wheres"].push([column, "in", input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push(
            makeWhere(column, operator, input[key][operator])
          );
        }
      } else {
        // In knex, we need to use null instead of undefined."
        const value = input[key] ?? null;
        newOptions["wheres"].push({ [column]: value });
      }
    }
    return new Relation(this.model, newOptions);
  }

  /**
   * Adds a "where not" condition to the current relation.
   *
   * @param input - The input object specifying the "where not" condition.
   * @returns A new instance of the Relation class with the added "where not" condition.
   */
  whereNot<T, M extends ModelMeta>(
    this: Relation<T, M>,
    input: M["WhereInput"]
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      if (!column) throw new Error(`Attribute not found: ${key}`);
      if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["wheres"].push([column, "not in", input[key][operator]]);
          } else {
            newOptions["whereNots"].push(
              makeWhere(column, operator, input[key][operator])
            );
          }
        }
      } else {
        // In knex, we need to use null instead of undefined."
        const value = input[key] ?? null;
        newOptions["whereNots"].push({ [column]: value });
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
