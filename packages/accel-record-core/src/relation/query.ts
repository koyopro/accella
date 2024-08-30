import { exec } from "../database.js";
import { RecordNotFound } from "../errors.js";
import { Model } from "../index.js";
import { ModelMeta } from "../meta.js";
import { Relation, Relations } from "./index.js";

/**
 * Provides the query methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Query {
  /**
   * Finds a record by its ID.
   * @param id - The ID of the record.
   * @returns The found record.
   * @throws An error if the record is not found.
   */
  find<T, M extends ModelMeta>(this: Relation<T, M>, key: M["PrimaryKey"]): T {
    const keys = [key].flat();
    const valid = keys.every((key) => typeof key !== "number" || isFinite(key));
    const where = this.model.primaryKeys.toHash((col, i) => [col, keys[i]]);
    const instance = valid ? this.setOption("wheres", [where]).first() : undefined;
    if (!instance) {
      throw new RecordNotFound("Record Not Found");
    }
    return instance;
  }

  /**
   * Retrieves the first n elements.
   *
   * @param [limit] - The maximum number of elements to retrieve.
   * @returns An array of elements.
   */
  first<T, M extends ModelMeta>(this: Relation<T, M>, limit: number): T[];
  /**
   * Returns the first element.
   * @returns The first element, or undefined if the relation is empty.
   */
  first<T, M extends ModelMeta>(this: Relation<T, M>): T | undefined;
  first<T, M extends ModelMeta>(this: Relation<T, M>, limit?: number): any {
    const queryLimit = limit ?? 1;
    const newOptions = { ...this.options, limit: queryLimit };
    if (this.options.orders.length == 0) {
      for (const key of this.model.primaryKeys) {
        newOptions.orders.push([key, "asc"]);
      }
    }
    const array = new Relation<T, M>(this.model, newOptions).load();
    return limit ? array : array[0];
  }
  /**
   * Retrieves the last n elements.
   *
   * @param [limit] - The maximum number of elements to retrieve.
   * @returns An array of elements.
   */
  last<T, M extends ModelMeta>(this: Relation<T, M>, limit: number): T[];
  /**
   * Returns the last element.
   * @returns The last element, or undefined if the relation is empty.
   */
  last<T, M extends ModelMeta>(this: Relation<T, M>): T | undefined;
  last<T, M extends ModelMeta>(this: Relation<T, M>, limit?: number): any {
    const queryLimit = limit ?? 1;
    const newOptions = { ...this.options, limit: queryLimit };
    if (this.options.orders.length == 0) {
      for (const key of this.model.primaryKeys) {
        newOptions.orders.push([key, "desc"]);
      }
    } else {
      newOptions.orders = this.options.orders.map(([key, direction]) => [
        key,
        direction == "asc" ? "desc" : "asc",
      ]);
    }
    const array = new Relation<T, M>(this.model, newOptions).load();
    return limit ? array : array[0];
  }
  /**
   * Sets the offset for the query result.
   *
   * @param offset - The number of rows to skip from the beginning of the result set.
   * @returns A new `Relation` object with the specified offset.
   */
  offset<T, M extends ModelMeta>(this: Relation<T, M>, offset: number): Relation<T, M> {
    return new Relation(this.model, { ...this.options, offset });
  }
  /**
   * Sets the maximum number of records to be returned by the query.
   *
   * @param limit - The maximum number of records to be returned.
   * @returns A new `Relation` instance with the specified limit.
   */
  limit<T, M extends ModelMeta>(this: Relation<T, M>, limit: number): Relation<T, M> {
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
    this: Relations<T, M>,
    attribute: keyof M["Column"],
    direction?: "asc" | "desc"
  ): Relation<T, M>;
  order<T, M extends ModelMeta>(
    this: Relation<T, M>,
    attribute: keyof M["Column"],
    direction: "asc" | "desc" = "asc"
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["orders"].push([this.model.attributeToColumn(attribute as string), direction]);
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
   * Updates all records in the relation with the specified attributes.
   *
   * @param {Partial<M["Column"]>} attributes - The attributes to update.
   */
  updateAll<T, M extends ModelMeta>(this: Relations<T, M>, attributes: Partial<M["Column"]>): void;
  updateAll<T, M extends ModelMeta>(this: Relation<T, M>, attributes: Partial<M["Column"]>) {
    const params: any = {};
    for (const key in attributes) {
      const column = this.model.attributeToColumn(key);
      if (column) params[column] = attributes[key] ?? null;
      else throw new Error(`Unknown attribute: ${key} for ${this.model.name}`);
    }
    exec(this.query().update(params));
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
   * Selects specific attributes from the model's persisted data.
   *
   * @param attributes - The attributes to select.
   * @returns A new relation with the selected attributes.
   */
  select<
    T,
    M extends ModelMeta,
    F extends (keyof M["Column"])[],
    // @ts-ignore
    R extends { [K in F[number]]: M["Persisted"][K] },
  >(this: Relations<T, M>, ...attributes: F): Relation<T extends Model ? R : T & R, M>;
  select<
    T,
    M extends ModelMeta,
    F extends (keyof M["Column"])[],
    // @ts-ignore
    R extends { [K in F[number]]: M["Persisted"][K] },
  >(this: Relation<T, M>, ...attributes: F): Relation<T extends Model ? R : T & R, M> {
    return new Relation(this.model, {
      ...this.options,
      select: [...this.options.select, ...(attributes as string[])],
    });
  }

  /**
   * Retrieves the values of a specified attribute from the records in the relation.
   *
   * If you want to specify multiple attributes, use {@link select | the select() method}.
   *
   * @param attribute - The attribute to retrieve from the records.
   * @returns An array containing the values of the specified attribute from the records.
   */
  pluck<T, M extends ModelMeta, F extends keyof M["Column"]>(
    this: Relations<T, M>,
    attribute: F
  ): M["Persisted"][F][] {
    return this.select(attribute).map((r) => r[attribute] as any);
  }
}
