import { Model } from "../index.js";
import { Options } from "../relation/options.js";

/**
 * Represents a lock that can be applied to a query when executing a SELECT statement.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Lock {
  /**
   * Applies a lock to the query when executing a SELECT statement.
   *
   * @param type The type of lock to apply. Defaults to "forUpdate".
   */
  static lock<T extends typeof Model>(
    this: T,
    type: Options["lock"] = "forUpdate"
  ) {
    return this.all().lock(type);
  }
}
