import { AttributeNotFound } from "../errors.js";
import { Model, Models, Relation } from "../index.js";
import { ModelMeta } from "../meta.js";
import { Options, Relations } from "./index.js";
import {
  Condition,
  hashCondition,
  listCondition,
  hashNotCondition,
  listNotCondition,
  orCondition,
  rawCondition,
} from "./options.js";
import { makeWhere, wrapAnd } from "./whereUtils.js";

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
  where<T, M extends ModelMeta>(this: Relations<T, M>, input: M["WhereInput"]): Relation<T, M>;
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
    const newOptions: Options = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      newOptions["conditions"].push(...this.buildConditions(input, key));
    }
    return new Relation(this.model, newOptions);
  }

  private buildConditions<T, M extends ModelMeta>(
    this: Relation<T, M>,
    input: M["WhereInput"],
    key: Extract<keyof M["WhereInput"], string>
  ): Condition[] {
    const column = this.model.attributeToColumn(key);
    const col = `${this.model.tableName}.${column}`;
    if (!column) {
      const conditions = this.buildAssocationConditions(key, input[key]);
      if (!conditions) throw new AttributeNotFound(`Attribute not found: ${key}`);
      return conditions;
    } else if (Array.isArray(input[key])) {
      return [listCondition([col, "in", input[key]])];
    } else if (input[key] != null && typeof input[key] === "object") {
      return Object.entries(input[key]).map(([operator, value]) =>
        listCondition(makeWhere(col, operator, value))
      );
    } else {
      // In knex, we need to use null instead of undefined."
      const value = input[key] ?? null;
      return [hashCondition({ [col]: value })];
    }
  }

  private buildAssocationConditions<T, M extends ModelMeta>(
    this: Relation<T, M>,
    key: Extract<keyof M["WhereInput"], string>,
    value: any,
    op: string = "in"
  ): Condition[] | undefined {
    const field = this.model.findField(key);
    if (field?.relationName == undefined) return;

    const records = [value].flat();
    if (records.length > 0 && !(records[0] instanceof Model)) {
      return Models[field.type].where(value).options.conditions;
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

    return Object.entries(where).map(([column, values]) => listCondition([column, op, values]));
  }

  /**
   * Adds a "where not" condition to the current relation.
   *
   * @param input - The input object specifying the "where not" condition.
   * @returns A new instance of the Relation class with the added "where not" condition.
   */
  whereNot<T, M extends ModelMeta>(this: Relations<T, M>, input: M["WhereInput"]): Relation<T, M>;
  whereNot<T, M extends ModelMeta>(this: Relation<T, M>, input: M["WhereInput"]): Relation<T, M> {
    const newOptions: Options = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      const col = `${this.model.tableName}.${column}`;
      if (!column) {
        newOptions["conditions"].push(...this.buildAssociationNotConditions(key, input));
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["conditions"].push(listCondition([col, "not in", input[key][operator]]));
          } else {
            newOptions["conditions"].push(
              listNotCondition(makeWhere(col, operator, input[key][operator]))
            );
          }
        }
      } else {
        // In knex, we need to use null instead of undefined."
        const value = input[key] ?? null;
        newOptions["conditions"].push(hashNotCondition({ [col]: value }));
      }
    }
    return new Relation(this.model, newOptions);
  }

  private buildAssociationNotConditions<T, M extends ModelMeta>(
    this: Relation<T, M>,
    key: Extract<keyof M["WhereInput"], string>,
    input: M["WhereInput"]
  ): Condition[] {
    const conditions = this.buildAssocationConditions(key, input[key], "not in");
    if (!conditions) throw new AttributeNotFound(`Attribute not found: ${key}`);
    return conditions.map((condition) => {
      if (condition.__op__ === "list" && condition.condition[1] !== "not in") {
        return listNotCondition(condition.condition);
      } else if (condition.__op__ === "hash") {
        return hashNotCondition(condition.condition);
      } else {
        return condition;
      }
    });
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
    const newOptions: Options = JSON.parse(JSON.stringify(this.options));
    newOptions["conditions"].push(rawCondition(query, bindings));
    return new Relation(this.model, newOptions);
  }

  /**
   * Combines the current relation with another relation using the OR operator.
   *
   * @param relation - The relation to combine with the current relation.
   * @returns A new relation that represents the combined result.
   */
  or<T, M extends ModelMeta>(this: Relation<T, M>, relation: Relation<T, M>): Relation<T, M>;
  /**
   * Adds a condition to the current relation using the OR operator.
   *
   * @param input - An object representing the WHERE clause.
   * @returns A new relation with the added condition.
   */
  or<T, M extends ModelMeta>(this: Relation<T, M>, input: M["WhereInput"]): Relation<T, M>;
  or<T, M extends ModelMeta>(
    this: Relation<T, M>,
    relationOrInput: Relation<T, M> | M["WhereInput"]
  ): Relation<T, M> {
    const relation: any =
      relationOrInput instanceof Relation
        ? relationOrInput
        : new Relation(this.model, {}).where(relationOrInput);
    const newOptions: Options = JSON.parse(JSON.stringify(this.options));
    const condition1 = wrapAnd(newOptions["conditions"]);
    const condition2 = wrapAnd(relation.options.conditions);
    newOptions["conditions"] = [orCondition([condition1, condition2])];
    return new Relation(this.model, newOptions);
  }
}
