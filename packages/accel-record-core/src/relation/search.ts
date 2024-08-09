import { ModelMeta } from "../meta.js";
import { Search } from "../search/index.js";
import { Relation } from "./index.js";

/**
 * Provides the search methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Searchable {
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
  search<T, M extends ModelMeta>(
    this: Relation<T, M>,
    params: Record<string, any>
  ) {
    return new Search(this.model, params, this);
  }
}
