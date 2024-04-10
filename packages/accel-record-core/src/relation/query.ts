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
  reset<T>(this: Relation<T, ModelMeta>) {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }
  /**
   * Returns the first element of the relation.
   * @returns The first element of the relation, or undefined if the relation is empty.
   */
  first<T, M extends ModelMeta>(this: Relation<T, M>): T | undefined {
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
  offset<T, M extends ModelMeta>(
    this: Relation<T, M>,
    offset: number
  ): Relation<T, M> {
    return new Relation(this.model, { ...this.options, offset });
  }
  /**
   * Sets the maximum number of records to be returned by the query.
   *
   * @param limit - The maximum number of records to be returned.
   * @returns A new `Relation` instance with the specified limit.
   */
  limit<T, M extends ModelMeta>(
    this: Relation<T, M>,
    limit: number
  ): Relation<T, M> {
    return new Relation(this.model, { ...this.options, limit });
  }
  /**
   * Orders the relation by the specified attribute and direction.
   *
   * @param attribute - The attribute to order by.
   * @param direction - The direction of the ordering. Defaults to "asc".
   * @returns A new Relation instance with the specified ordering applied.
   */
  order<T, M extends ModelMeta>(
    this: Relation<T, M>,
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
   * Checks if the relation has any records.
   * @returns {boolean} True if the relation has records, false otherwise.
   */
  exists<T>(this: Relation<T, ModelMeta>): boolean {
    return this.first() !== undefined;
  }
  /**
   * Checks if the relation is empty.
   * @returns {boolean} Returns true if the relation is empty, false otherwise.
   */
  isEmpty<T>(this: Relation<T, ModelMeta>): boolean {
    return !this.exists();
  }
  /**
   * Deletes all records associated with the current relation.
   */
  deleteAll<T>(this: Relation<T, ModelMeta>) {
    exec(this.query().del());
  }
  /**
   * Destroys all records in the relation.
   * It will be destroyed using the `destroy` method.
   */
  destroyAll<T>(this: Relation<T, ModelMeta>) {
    for (const record of this.toArray()) {
      if (record instanceof Model) record.destroy();
    }
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
    T,
    M extends ModelMeta,
    F extends (keyof M["OrderInput"])[],
    // @ts-ignore
    R extends { [K in F[number]]: M["Persisted"][K] },
  >(
    this: Relation<T, M>,
    ...attributes: F
  ): Relation<T extends Model ? R : T & R, M> {
    return new Relation(this.model, {
      ...this.options,
      select: [...this.options.select, ...(attributes as string[])],
    });
  }
}
