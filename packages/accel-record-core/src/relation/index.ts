import { exec } from "../database.js";
import { Model, type ModelMeta } from "../index.js";
import { classIncludes } from "../utils.js";
import { Association } from "./association.js";
import { RelationBase } from "./base.js";
import { Options, getDefaultOptions } from "./options.js";
import { Query } from "./query.js";
import { Where } from "./where.js";

export { Options } from "./options.js";

export class Relation<T, M extends ModelMeta> extends classIncludes(
  Association,
  Query,
  RelationBase,
  Where
) {
  protected counter = 0;
  protected queryBuilder: any;
  protected options: Options;
  constructor(
    protected model: typeof Model,
    options: Partial<Options> = {},
    protected cache: T[] | undefined = undefined
  ) {
    super();
    this.model = model;
    this.queryBuilder = model.queryBuilder;
    this.options = Object.assign(getDefaultOptions(), options) as Options;
  }
  /**
   * Converts the relation to an array of type T.
   * If the cache is already populated, it returns the cached array.
   * Otherwise, it loads the relation and caches the result before returning it.
   * @returns An array of type T.
   */
  toArray(): T[] {
    return (this.cache ||= this.load());
  }
  /**
   * Applies a function to each element in the relation and returns an array of the results.
   *
   * @template F - The type of the mapping function.
   * @param {F} func - The mapping function to apply to each element.
   * @returns {ReturnType<F>[]} - An array of the results of applying the mapping function to each element.
   */
  map<F extends (value: T, index: number, array: T[]) => any>(
    func: F
  ): ReturnType<F>[] {
    return this.toArray().map((row, i, array) => func(row, i, array));
  }
  /**
   * Selects specific attributes from the model or persisted data.
   *
   * @typeparam F - The type of the attributes to select.
   * @typeparam R - The resulting type after selecting the attributes.
   * @param attributes - The attributes to select.
   * @returns A new relation with the selected attributes.
   */
  select<
    F extends (keyof M["OrderInput"])[],
    // @ts-ignore
    R extends { [K in F[number]]: M["Persisted"][K] },
  >(...attributes: F): Relation<T extends Model ? R : T & R, M> {
    return new Relation(this.model, {
      ...this.options,
      select: [...this.options.select, ...(attributes as string[])],
    });
  }
  /**
   * Returns the first element of the relation.
   * @returns The first element of the relation, or undefined if the relation is empty.
   */
  first(): T | undefined {
    if (this.cache) return this.cache[0];
    return new Relation<T, M>(this.model, {
      ...this.options,
      limit: 1,
    }).load()[0];
  }
  /**
   * Sets the offset for the query result.
   *
   * @param offset - The number of rows to skip from the beginning of the result set.
   * @returns A new `Relation` object with the specified offset.
   */
  offset(offset: number): Relation<T, M> {
    return new Relation(this.model, { ...this.options, offset });
  }
  /**
   * Sets the maximum number of records to be returned by the query.
   *
   * @param limit - The maximum number of records to be returned.
   * @returns A new `Relation` instance with the specified limit.
   */
  limit(limit: number): Relation<T, M> {
    return new Relation(this.model, { ...this.options, limit });
  }
  /**
   * Orders the relation by the specified attribute and direction.
   *
   * @param attribute - The attribute to order by.
   * @param direction - The direction of the ordering. Defaults to "asc".
   * @returns A new Relation instance with the specified ordering applied.
   */
  order(
    attribute: keyof M["OrderInput"],
    direction: "asc" | "desc" = "asc"
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["orders"].push([
      this.model.attributeToColumn(attribute as string),
      direction,
    ]);
    return new Relation(this.model, newOptions);
  }

  /**
   * Adds a WHERE clause to the query.
   *
   * @param input - An object representing the WHERE clause.
   * @returns A new instance of the Relation class with the WHERE clause added.
   */
  where(input: M["WhereInput"]): Relation<T, M>;
  /**
   * Adds a WHERE clause to the query.
   *
   * @param query - The query string or an object representing the WHERE clause.
   * @param bindings - Optional bindings for the query.
   * @returns A new instance of the Relation class with the WHERE clause added.
   */
  where(query: string, ...bindings: any[]): Relation<T, M>;
  where(
    queryOrInput: string | M["WhereInput"],
    ...bindings: any[]
  ): Relation<T, M> {
    if (typeof queryOrInput === "string") {
      return this.whereRaw(queryOrInput, ...bindings);
    }
    return new Relation(this.model, this.addWhere(queryOrInput));
  }
  /**
   * Adds a "where not" condition to the current relation.
   *
   * @param input - The input object specifying the "where not" condition.
   * @returns A new instance of the Relation class with the added "where not" condition.
   */
  whereNot(input: M["WhereInput"]): Relation<T, M> {
    return new Relation(this.model, this.addWhereNot(input));
  }
  /**
   * Adds a raw WHERE clause to the query.
   *
   * @param query - The raw SQL query string.
   * @param bindings - The parameter bindings for the query.
   * @returns A new `Relation` instance with the added WHERE clause.
   */
  whereRaw(query: string, ...bindings: any[]): Relation<T, M> {
    return new Relation(this.model, this.addWhereRaw(query, ...bindings));
  }
  /**
   * Adds associations to be included in the query result.
   *
   * @param input - The association keys to include.
   * @returns A new `Relation` instance with the specified associations included.
   */
  includes(...input: M["AssociationKey"][]): Relation<T, M> {
    return new Relation(this.model, this.addIncludes(...input));
  }
  /**
   * Adds join conditions to the relation.
   *
   * @param input - The association keys to join.
   * @returns A new `Relation` instance with the added join conditions.
   */
  joins(...input: M["AssociationKey"][]): Relation<T, M> {
    return new Relation(this.model, this.addJoins(...input));
  }
  /**
   * Adds a raw join clause to the query.
   *
   * @param query - The raw SQL query string.
   * @param bindings - The bindings to be used in the query.
   * @returns A new `Relation` instance with the added join clause.
   */
  joinsRaw(query: string, ...bindings: any[]): Relation<T, M> {
    return new Relation(this.model, this.addJoinsRaw(query, ...bindings));
  }
  /**
   * Returns the minimum value of the specified attribute.
   *
   * @param attribute - The attribute to find the minimum value for.
   * @returns The minimum value of the specified attribute.
   */
  minimum(attribute: keyof M["OrderInput"]) {
    const res = exec(
      this.query().min(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  /**
   * Returns the maximum value of the specified attribute.
   *
   * @param attribute - The attribute to find the maximum value for.
   * @returns The maximum value of the specified attribute.
   */
  maximum(attribute: keyof M["OrderInput"]) {
    const res = exec(
      this.query().max(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  /**
   * Calculates the average value of the specified attribute.
   *
   * @param attribute - The attribute to calculate the average for.
   * @returns The average value of the specified attribute.
   */
  average(attribute: keyof M["OrderInput"]) {
    const res = exec(
      this.query().avg(this.model.attributeToColumn(attribute as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  load(): T[] {
    return this._load();
  }
  /**
   * Returns an iterator for the Relation class.
   * @returns An iterator object with `next()` and `return()` methods.
   */
  [Symbol.iterator]() {
    const _this = this;
    return {
      next(): { value: T; done: boolean } {
        const done = _this.counter === _this.toArray().length;
        const value = (
          done ? undefined : _this.toArray()![_this.counter++]
        ) as T;
        return { value, done };
      },
      return(): { value: T; done: boolean } {
        return { done: true, value: undefined as T };
      },
    };
  }
}
