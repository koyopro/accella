import { Model } from "../index.js";
import { type ModelMeta } from "../meta.js";
import { ToHashOptions, ToHashResult } from "../model/serialization.js";
import { classIncludes } from "../utils.js";
import { Association } from "./association.js";
import { RelationBase } from "./base.js";
import { Calculations } from "./calculations.js";
import { Options, getDefaultOptions } from "./options.js";
import { Query } from "./query.js";
import { Where } from "./where.js";

export { Options } from "./options.js";

// @ts-ignore
export class Relation<T, M extends ModelMeta> extends classIncludes(
  Association,
  Calculations,
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

  toHashArray<O extends ToHashOptions<T>>(
    options?: O
  ): T extends Model ? ToHashResult<T, O>[] : never;
  toHashArray(options = {}): Record<string, any>[] {
    return this.toArray().map((row) =>
      row instanceof Model ? row.toHash(options) : {}
    );
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
