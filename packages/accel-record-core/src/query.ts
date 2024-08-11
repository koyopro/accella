import { RecordNotFound } from "./errors.js";
import { type Model } from "./index.js";
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
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
    callback?: (obj: Meta<T>["Persisted"]) => void
  ): Meta<T>["Persisted"] {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
    return this.all().includes(...input);
  }

  /**
   * Joins associations in the query result.
   * @param input - The associations to join.
   * @returns A `Relation` object representing the query result with the joined associations.
   */
  static joins<T extends typeof Model>(
    this: T,
    input: Meta<T>["JoinInput"]
  ): Relation<Meta<T>["Persisted"], Meta<T>>;
  /**
   * Joins associations in the query result.
   * @param input - The associations to join.
   * @returns A `Relation` object representing the query result with the joined associations.
   */
  static joins<T extends typeof Model>(
    this: T,
    ...input: Meta<T>["AssociationKey"][]
  ): Relation<Meta<T>["Persisted"], Meta<T>>;
  static joins<T extends typeof Model>(this: T, ...input: any[]) {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
    return this.all().joinsRaw(query, ...bindings);
  }

  /**
   * Selects specific columns in the query result.
   * @param columns - The columns to select.
   * @returns A `Relation` object representing the query result with the selected columns.
   */
  static select<T extends typeof Model, F extends (keyof Meta<T>["Column"])[]>(
    this: T,
    ...attributes: F
    // @ts-ignore
  ): Relation<{ [K in F[number]]: Meta<T>["Persisted"][K] }, Meta<T>> {
    // @ts-ignore
    return this.all().select(...attributes);
  }

  /**
   * Retrieves the specified attribute values from all persisted instances of the model.
   *
   * If you want to specify multiple attributes, use {@link select | the select() method}.
   *
   * @param attribute - The attribute key to retrieve.
   * @returns An array of attribute values from all persisted instances of the model.
   */
  static pluck<
    T extends typeof Model,
    M extends Meta<T>,
    F extends keyof M["Column"],
  >(this: T, attribute: F): M["Persisted"][F][] {
    return this.all().pluck(attribute as any);
  }

  /**
   * Retrieves the first n records of the model.
   * @returns The first record of the model.
   */
  static first<T extends typeof Model>(
    this: T,
    limit: number
  ): Meta<T>["Persisted"][];
  /**
   * Retrieves the first record of the model.
   * @returns The first record of the model.
   */
  static first<T extends typeof Model>(
    this: T
  ): Meta<T>["Persisted"] | undefined;
  static first<T extends typeof Model>(
    this: T,
    limit?: number
  ): Meta<T>["Persisted"] | Meta<T>["Persisted"][] | undefined {
    return limit ? this.all().first(limit) : this.all().first();
  }

  /**
   * Retrieves the last n records of the model.
   * @returns The last record of the model.
   */
  static last<T extends typeof Model>(
    this: T,
    limit: number
  ): Meta<T>["Persisted"][];
  /**
   * Retrieves the last record of the model.
   * @returns The last record of the model.
   */
  static last<T extends typeof Model>(
    this: T
  ): Meta<T>["Persisted"] | undefined;
  static last<T extends typeof Model>(
    this: T,
    limit?: number
  ): Meta<T>["Persisted"] | Meta<T>["Persisted"][] | undefined {
    return limit ? this.all().last(limit) : this.all().last();
  }

  /**
   * Updates all records in the model's table with the specified attributes.
   *
   * @param attributes - The attributes to update the records with.
   */
  static updateAll<T extends typeof Model>(
    this: T,
    attributes: Partial<Meta<T>["Column"]>
  ): void {
    return this.all().updateAll(attributes);
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
    attribute: keyof Meta<T>["Column"],
    direction?: "asc" | "desc"
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
    return this.all().limit(limit);
  }

  /**
   * @function where
   * @description Filters the model instances based on the provided input.
   * @param {T} this - The model class.
   * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
   * @returns {Relation<Meta<T>['Persisted'], Meta<T>>} - The relation containing the filtered model instances.
   */
  static where<T extends typeof Model>(
    this: T,
    input: Meta<T>["WhereInput"]
  ): Relation<Meta<T>["Persisted"], Meta<T>>;

  /**
   * @function where
   * @description Filters the model instances based on the provided query and bindings.
   * @param {T} this - The model class.
   * @param {string} query - The query string.
   * @param {...any[]} bindings - The query bindings.
   * @returns {Relation<Meta<T>['Persisted'], Meta<T>>} - The relation containing the filtered model instances.
   */
  static where<T extends typeof Model>(
    this: T,
    query: string,
    ...bindings: any[]
  ): Relation<Meta<T>["Persisted"], Meta<T>>;

  static where<T extends typeof Model>(
    this: T,
    queryOrInput: string | Meta<T>["WhereInput"],
    ...bindings: any[]
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
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
  ): Relation<Meta<T>["Persisted"], Meta<T>> {
    return this.all().whereRaw(query, ...bindings);
  }

  /**
   * Finds a record by its ID.
   * @param id - The ID of the record.
   * @returns The found record.
   * @throws An error if the record is not found.
   */
  static find<T extends typeof Model>(
    this: T,
    id: number
  ): Meta<T>["Persisted"] {
    const instance = isFinite(id)
      ? this.all()
          .setOption("wheres", [{ [this.primaryKeys[0]]: id }])
          .first()
      : undefined;
    if (!instance) {
      throw new RecordNotFound("Record Not Found");
    }
    return instance;
  }

  /**
   * Finds a record by the specified parameters.
   * @param input - The parameters used to find the record.
   * @returns The found record.
   */
  static findBy<T extends typeof Model>(
    this: T,
    input: Meta<T>["WhereInput"]
  ): Meta<T>["Persisted"] | undefined {
    return this.all().where(input).first();
  }

  /**
   * Retrieves the maximum value of the specified attribute.
   * @param attribute - The attribute to retrieve the maximum value for.
   * @returns The maximum value of the attribute.
   */
  static maximum<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["Column"]
  ): number {
    return this.all().maximum(attribute);
  }

  /**
   * Retrieves the minimum value of the specified attribute.
   * @param attribute - The attribute to retrieve the minimum value for.
   * @returns The minimum value of the attribute.
   */
  static minimum<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["Column"]
  ): number {
    return this.all().minimum(attribute);
  }

  /**
   * Retrieves the average value of the specified attribute.
   * @param attribute - The attribute to retrieve the average value for.
   * @returns The average value of the attribute.
   */
  static average<T extends typeof Model>(
    this: T,
    attribute: keyof Meta<T>["Column"]
  ): number {
    return this.all().average(attribute);
  }

  /**
   * Iterates over the records in batches, loading a specified number of records at a time.
   *
   * @param options.batchSize - The number of records to load in each batch. Defaults to 1000.
   * @returns - An iterator object that allows iterating over the model in batches.
   */
  static findEach<T extends typeof Model>(
    this: T,
    options?: { batchSize?: number }
  ) {
    // @ts-ignore
    return this.all().findEach<InstanceType<T>, Meta<T>>(options);
  }

  /**
   * Iterates over the records in batches, allowing you to process a large number of records in smaller chunks.
   *
   * @param options.batchSize - The size of each batch. Defaults to 1000 if not provided.
   * @returns An iterator object that provides the records in batches.
   */
  static findInBatches<T extends typeof Model>(
    this: T,
    options?: { batchSize?: number }
  ) {
    // @ts-ignore
    return this.all().findInBatches<InstanceType<T>, Meta<T>>(options);
  }
}
