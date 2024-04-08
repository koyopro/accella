import type { Model } from "./index.js";
import type { Meta } from "./meta.js";
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
  static all<T extends typeof Model>(
    this: T
  ): Relation<InstanceType<T>, Meta<T>> {
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
  static findOrInitializeBy<T extends typeof Model>(
    this: T,
    params: Parameters<typeof Model.build<T>>[0],
    callback?: (obj: Meta<T>["Base"]) => void
  ): Meta<T>["Base"] {
    const user = this.findBy(params);
    if (user) return user;
    const newUser = this.build(params);
    callback?.(newUser);
    return newUser;
  }

  /**
   * Includes associations in the query result.
   * @param input - The associations to include.
   * @returns A `Relation` object representing the query result with the included associations.
   */
  static includes<T extends typeof Model>(
    this: T,
    ...input: Meta<T>["AssociationKey"][]
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().includes(...input);
  }

  /**
   * Joins associations in the query result.
   * @param input - The associations to join.
   * @returns A `Relation` object representing the query result with the joined associations.
   */
  static joins<T extends typeof Model>(
    this: T,
    ...input: Meta<T>["AssociationKey"][]
  ): Relation<InstanceType<T>, Meta<T>> {
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
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().joinsRaw(query, ...bindings);
  }

  /**
   * Selects specific columns in the query result.
   * @param columns - The columns to select.
   * @returns A `Relation` object representing the query result with the selected columns.
   */
  static select<
    T extends typeof Model,
    F extends (keyof Meta<T>["OrderInput"])[],
  >(
    this: T,
    ...attributes: F
    // @ts-ignore
  ): Relation<{ [K in F[number]]: InstanceType<T>[K] }, Meta<T>> {
    return this.all().select(...attributes);
  }

  /**
   * Retrieves the first record of the model.
   * @returns The first record of the model.
   */
  static first<T extends typeof Model>(this: T) {
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
  // function order<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<InstanceType<T>, Meta<T>>;
  static order<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["OrderInput"],
    direction?: "asc" | "desc"
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().order(attribute, direction);
  }

  /**
   * Sets the offset for the query result.
   * @param offset - The offset value.
   * @returns A `Relation` object representing the query result with the offset applied.
   */
  static offset<T extends typeof Model>(
    this: T,
    offset: number
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().offset(offset);
  }

  /**
   * Sets the limit for the query result.
   * @param limit - The limit value.
   * @returns A `Relation` object representing the query result with the limit applied.
   */
  static limit<T extends typeof Model>(
    this: T,
    limit: number
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().limit(limit);
  }

  /**
   * @function where
   * @description Filters the model instances based on the provided input.
   * @param {T} this - The model class.
   * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
   * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
   */
  static where<T extends typeof Model>(
    this: T,
    input: Meta<T>["WhereInput"]
  ): Relation<InstanceType<T>, Meta<T>>;

  /**
   * @function where
   * @description Filters the model instances based on the provided query and bindings.
   * @param {T} this - The model class.
   * @param {string} query - The query string.
   * @param {...any[]} bindings - The query bindings.
   * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
   */
  static where<T extends typeof Model>(
    this: T,
    query: string,
    ...bindings: any[]
  ): Relation<InstanceType<T>, Meta<T>>;

  static where<T extends typeof Model>(
    this: T,
    queryOrInput: string | Meta<T>["WhereInput"],
    ...bindings: any[]
  ): Relation<InstanceType<T>, Meta<T>> {
    if (typeof queryOrInput === "string") {
      return this.whereRaw(queryOrInput, ...bindings);
    } else {
      return this.all().where(queryOrInput);
    }
  }

  /**
   * Adds a WHERE NOT condition to the query.
   * @param input - The WHERE NOT condition.
   * @returns A `Relation` object representing the query result with the WHERE NOT condition applied.
   */
  static whereNot<T extends typeof Model>(
    this: T,
    input: Meta<T>["WhereInput"]
  ): Relation<InstanceType<T>, Meta<T>> {
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
    ...bindings: any[]
  ): Relation<InstanceType<T>, Meta<T>> {
    return this.all().whereRaw(query, ...bindings);
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
  static findBy<T extends typeof Model>(
    this: T,
    input: Meta<T>["WhereInput"]
  ): InstanceType<T> | undefined {
    return this.all().where(input).first();
  }

  /**
   * Retrieves the maximum value of the specified attribute.
   * @param attribute - The attribute to retrieve the maximum value for.
   * @returns The maximum value of the attribute.
   */
  static maximum<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["OrderInput"]
  ) {
    return this.all().maximum(attribute);
  }

  /**
   * Retrieves the minimum value of the specified attribute.
   * @param attribute - The attribute to retrieve the minimum value for.
   * @returns The minimum value of the attribute.
   */
  static minimum<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["OrderInput"]
  ) {
    return this.all().minimum(attribute);
  }

  /**
   * Retrieves the average value of the specified attribute.
   * @param attribute - The attribute to retrieve the average value for.
   * @returns The average value of the attribute.
   */
  static average<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["OrderInput"]
  ) {
    return this.all().average(attribute);
  }
}
