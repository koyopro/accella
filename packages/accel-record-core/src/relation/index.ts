import { Collection, Model } from "../index.js";
import { type ModelMeta } from "../meta.js";
import { Search } from "../model/search.js";
import { ToHashOptions, ToHashResult } from "../model/serialization.js";
import { getStaticProperties, Mix } from "../utils.js";
import { Association } from "./association.js";
import { RelationBase } from "./base.js";
import { Batches } from "./batches.js";
import { Calculations } from "./calculations.js";
import { Merge } from "./merge.js";
import { getDefaultOptions, Options } from "./options.js";
import { Query } from "./query.js";
import { Where } from "./where.js";

export { Options } from "./options.js";

export type Relations<T, M extends ModelMeta> =
  | Relation<T, M>
  | Collection<T extends Model ? T : any, M>;

export class Relation<T, M extends ModelMeta> extends Mix(
  Association,
  Batches,
  Calculations,
  Merge,
  Query,
  RelationBase,
  Where
) {
  protected counter = 0;
  protected options: Options;
  constructor(
    protected model: typeof Model,
    options: Partial<Options> = {},
    protected cache: T[] | undefined = undefined
  ) {
    super();
    this.model = model;
    this.options = Object.assign(getDefaultOptions(), options) as Options;
    for (const [f, _] of getStaticProperties(model)) {
      const method = model[f as keyof typeof model] as any;
      if (method?.isAccelRecordScope) {
        (this as any)[f] = (...args: any[]) => method.apply(this, args);
      }
    }
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
   * Converts the relation to an array of hash objects.
   *
   * @param options - The options for the conversion.
   * @returns An array of hash objects.
   */
  toHashArray<O extends ToHashOptions<T>>(
    options?: O
  ): T extends Model ? ToHashResult<T, O>[] : never;
  toHashArray(options = {}): Record<string, any>[] {
    return this.toArray().map((row) =>
      row instanceof Model ? row.toHash(options) : {}
    );
  }

  /**
   * Converts the relation to a JSON string representation.
   *
   * @param options - The options for the conversion.
   * @returns A JSON string representation of the relation.
   */
  toJson<O extends ToHashOptions<T>>(
    options?: O
  ): T extends Model ? string : never;
  toJson(options = {}): string {
    return JSON.stringify(this.toHashArray(options));
  }

  /**
   * Creates a new search instance.
   * @param params - The search parameters.
   * @returns A new search instance.
   * @example
   * ```ts
   * const search = User.search({ name_eq: "foo" });
   * const users = search.result();
   * ```
   * @details
   * The search parameters are used to filter the results of the search. \
   * The search parameters are specified as key-value pairs. \
   * The key is the name of the attribute to search for.
   * The key can include associations. \
   * The value is the value to search for.
   *
   * The search parameters can include the following:
   * - `*_eq` - The attribute is equal to the value.
   * - `*_cont` - The attribute contains the value.
   * - `*_start` - The attribute starts with the value.
   * - `*_end` - The attribute ends with the value.
   * - `*_matches` - The attribute matches the value (Use the `LIKE` clause).
   * - `*_lt` - The attribute is less than the value.
   * - `*_lte` - The attribute is less than or equal to the value.
   * - `*_gt` - The attribute is greater than the value.
   * - `*_gte` - The attribute is greater than or equal to the value.
   * - `*_in` - The attribute is in the list of values.
   * - `*_true` - The attribute is true.
   * - `*_false` - The attribute is false.
   * - `*_null` - The attribute is null.
   * - `*_blank` - The attribute is blank.
   * - `*_present` - The attribute is present.
   *
   * The search parameters can also include the following modifiers:
   * - `not` (`does_not`) - The value must not match.
   * - `all` - All of the values must match.
   * - `any` - Any of the values must match.
   *
   * The search parameters can also include the following logical operators:
   * - `and` - The values must match all of the attributes.
   * - `or` - The values must match any of the attributes.
   * @example
   * ```ts
   * const search = User.search({
   *   profile_bio_cont: "foo", // with association
   *   age_not_null: 1,         // with `not` modifier
   *   email_or_name_cont_any: ["bar", "baz"], // with `or` operator and `any` modifier
   * });
   * const users = search.result();
   * ```
   * @details
   * The keys of the search parameters can include the names of the searchable scopes defined in the `searchableScopes` array. \
   * The values of the search parameters specify the values to search for.
   * @example
   * ```ts
   * class UserModel extends ApplicationRecord {
   *   static bio_cont(value: string) {
   *     return this.joins("profile").where({
   *       profile: { bio: { 'contains': value } },
   *     });
   *   }
   *   static searchableScopes = ["bio_cont"];
   * }
   * ```
   * // The `bio_cont` scope can be used in the search parameters.
   * ```ts
   * const search = User.search({ bio_cont: "foo" });
   * const users = search.result();
   * ```
   */
  search(params: Record<string, any>) {
    return new Search(this.model, params, this);
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
