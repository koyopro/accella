import type { Model, ModelMeta } from "./index.js";
import { Relation } from "./relation/index.js";

/**
 * Represents a query class for performing database queries.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Query {
  /**
   * Retrieves all records of the model.
   * @returns A `Relation` object representing the query result.
   */
  static all<T extends typeof Model>(this: T): Relation<any, any> {
    return new Relation(this);
  }

  /**
   * Finds or creates a record based on the given parameters.
   * @param params - The parameters used to find or create the record.
   * @param callback - An optional callback function to be called with the newly created record.
   * @returns The found or newly created record.
   */
  static findOrCreateBy<T extends typeof Model>(
    this: T,
    params: Parameters<typeof Model.create<T>>[0],
    callback?: (obj: InstanceType<T>) => void
  ): InstanceType<T> {
    const user = this.findBy(params);
    if (user) return user;
    const newUser = this.create(params);
    callback?.(newUser);
    return newUser;
  }

  /**
   * Finds or initializes a record based on the given parameters.
   * @param params - The parameters used to find or initialize the record.
   * @param callback - An optional callback function to be called with the found or initialized record.
   * @returns The found or initialized record.
   */
  static findOrInitializeBy<
    T extends typeof Model,
    S extends
      | ReturnType<typeof Model.build<T>>
      | ReturnType<typeof Model.create<T>>,
  >(
    this: T,
    params: Parameters<typeof Model.build<T>>[0],
    callback?: (obj: S) => void
  ): S {
    const user = this.findBy(params);
    if (user) return user;
    const newUser = this.build(params) as S;
    callback?.(newUser);
    return newUser;
  }

  /**
   * Includes associations in the query result.
   * @param input - The associations to include.
   * @returns A `Relation` object representing the query result with the included associations.
   */
  static includes<
    T extends typeof Model,
    R extends ModelMeta["AssociationKey"][],
  >(this: T, ...input: R): Relation<any, any> {
    return this.all().includes(...input);
  }

  /**
   * Joins associations in the query result.
   * @param input - The associations to join.
   * @returns A `Relation` object representing the query result with the joined associations.
   */
  static joins<T extends typeof Model, R extends ModelMeta["AssociationKey"][]>(
    this: T,
    ...input: R
  ): Relation<any, any> {
    return this.all().joins(...input);
  }

  /**
   * Joins associations using a raw SQL query.
   * @param query - The raw SQL query to join associations.
   * @param bindings - The bindings for the raw SQL query.
   * @returns A `Relation` object representing the query result with the joined associations.
   */
  static joinsRaw<T extends typeof Model>(
    this: T,
    query: string,
    ...bindings: any[]
  ): Relation<any, any> {
    return this.all().joinsRaw(query, ...bindings);
  }

  /**
   * Selects specific columns in the query result.
   * @param columns - The columns to select.
   * @returns A `Relation` object representing the query result with the selected columns.
   */
  static select<T extends typeof Model>(
    this: T,
    ...columns: string[]
  ): Relation<any, any> {
    return this.all().select(...columns);
  }

  /**
   * Retrieves the first record of the model.
   * @returns The first record of the model.
   */
  static first<T extends typeof Model>(this: T): InstanceType<T> {
    return this.all().first();
  }

  /**
   * Checks if any records exist for the model.
   * @returns `true` if records exist, `false` otherwise.
   */
  static exists<T extends typeof Model>(this: T): boolean {
    return this.all().exists();
  }

  /**
   * Checks if the model is empty (no records).
   * @returns `true` if the model is empty, `false` otherwise.
   */
  static isEmpty<T extends typeof Model>(this: T): boolean {
    return this.all().isEmpty();
  }

  /**
   * Retrieves the count of records for the model.
   * @returns The count of records for the model.
   */
  static count<T extends typeof Model>(this: T): number {
    return this.all().count();
  }

  /**
   * Orders the query result by the specified attribute and direction.
   * @param attribute - The attribute to order by.
   * @param direction - The direction of the ordering (ascending or descending).
   * @returns A `Relation` object representing the ordered query result.
   */
  static order<T extends typeof Model>(
    this: T,
    attribute: string,
    direction: "asc" | "desc" = "asc"
  ) {
    return this.all().order(attribute, direction);
  }

  /**
   * Sets the offset for the query result.
   * @param offset - The offset value.
   * @returns A `Relation` object representing the query result with the offset applied.
   */
  static offset<T extends typeof Model>(this: T, offset: number) {
    return this.all().offset(offset);
  }

  /**
   * Sets the limit for the query result.
   * @param limit - The limit value.
   * @returns A `Relation` object representing the query result with the limit applied.
   */
  static limit<T extends typeof Model>(this: T, limit: number) {
    return this.all().limit(limit);
  }

  /**
   * Adds a WHERE condition to the query.
   * @param input - The WHERE condition.
   * @returns A `Relation` object representing the query result with the WHERE condition applied.
   */
  static where<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input);
  }

  /**
   * Adds a WHERE NOT condition to the query.
   * @param input - The WHERE NOT condition.
   * @returns A `Relation` object representing the query result with the WHERE NOT condition applied.
   */
  static whereNot<T extends typeof Model>(this: T, input: object) {
    return this.all().whereNot(input);
  }

  /**
   * Adds a raw WHERE condition to the query.
   * @param query - The raw SQL query for the WHERE condition.
   * @param bindings - The bindings for the raw SQL query.
   * @returns A `Relation` object representing the query result with the raw WHERE condition applied.
   */
  static whereRaw<T extends typeof Model>(
    this: T,
    query: string,
    bindings: any[] = []
  ) {
    return this.all().whereRaw(query, bindings);
  }

  /**
   * Finds a record by its ID.
   * @param id - The ID of the record.
   * @returns The found record.
   * @throws An error if the record is not found.
   */
  static find<T extends typeof Model>(this: T, id: number) {
    const instance = this.all()
      .setOption("wheres", [{ [this.primaryKeys[0]]: id }])
      .first();
    if (!instance) {
      throw new Error("Record Not found");
    }
    return instance as InstanceType<T>;
  }

  /**
   * Finds a record by the specified parameters.
   * @param input - The parameters used to find the record.
   * @returns The found record.
   */
  static findBy<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input).first();
  }

  /**
   * Retrieves the maximum value of the specified attribute.
   * @param attribute - The attribute to retrieve the maximum value for.
   * @returns The maximum value of the attribute.
   */
  static maximum<T extends typeof Model>(this: T, attribute: string) {
    return this.all().maximum(attribute);
  }

  /**
   * Retrieves the minimum value of the specified attribute.
   * @param attribute - The attribute to retrieve the minimum value for.
   * @returns The minimum value of the attribute.
   */
  static minimum<T extends typeof Model>(this: T, attribute: string) {
    return this.all().minimum(attribute);
  }

  /**
   * Retrieves the average value of the specified attribute.
   * @param attribute - The attribute to retrieve the average value for.
   * @returns The average value of the attribute.
   */
  static average<T extends typeof Model>(this: T, attribute: string) {
    return this.all().average(attribute);
  }
}
