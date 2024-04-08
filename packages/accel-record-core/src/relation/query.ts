import { exec } from "../database.js";
import { Model } from "../index.js";
import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

/**
 * Provides the query methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Query {
  reset(this: Relation<unknown, ModelMeta>) {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }
  /**
   * Returns the number of records in the relation.
   * @returns The number of records in the relation.
   */
  count(this: Relation<unknown, ModelMeta>): number {
    const res = exec(
      this.query().count(`${this.model.tableName}.${this.model.primaryKeys[0]}`)
    );
    return Number(Object.values(res[0])[0]);
  }
  /**
   * Checks if the relation has any records.
   * @returns {boolean} True if the relation has records, false otherwise.
   */
  exists(this: Relation<unknown, ModelMeta>): boolean {
    return this.first() !== undefined;
  }
  /**
   * Checks if the relation is empty.
   * @returns {boolean} Returns true if the relation is empty, false otherwise.
   */
  isEmpty(this: Relation<unknown, ModelMeta>): boolean {
    return !this.exists();
  }
  /**
   * Deletes all records associated with the current relation.
   */
  deleteAll(this: Relation<unknown, ModelMeta>) {
    exec(this.query().del());
  }
  /**
   * Destroys all records in the relation.
   * It will be destroyed using the `destroy` method.
   */
  destroyAll(this: Relation<unknown, ModelMeta>) {
    for (const record of this.toArray()) {
      if (record instanceof Model) record.destroy();
    }
  }
}
