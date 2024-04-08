import { HasManyAssociation } from "./associations/hasManyAssociation.js";
import { HasOneAssociation } from "./associations/hasOneAssociation.js";
import { ModelInstanceBuilder } from "./associations/modelInstanceBuilder.js";
import { exec, execSQL } from "./database.js";
import { Collection, Meta, Model, New, Persisted } from "./index.js";

/**
 * Represents a Persistence class that provides methods for managing records.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Persistence {
  isNewRecord: boolean = true;
  isReadonly: boolean = false;
  isDestroyed: boolean = false;

  /**
   * Builds a new instance of the model using the provided input.
   *
   * @template T - The type of the model.
   * @param input - The input data used to build the model instance.
   * @returns A new instance of the model.
   */
  static build<T extends typeof Model>(
    this: T,
    input: Partial<Meta<T>["CreateInput"]>
  ): New<T> {
    const obj = ModelInstanceBuilder.build(this as T, input);
    obj.storeOriginalValues();
    return obj;
  }

  /**
   * Creates a new instance of the model using the provided input, saves it, and returns the instance.
   *
   * @template T - The type of the model.
   * @param input - The input data used to create the model instance.
   * @returns The created instance of the model.
   */
  static create<T extends typeof Model>(
    this: T,
    input: Meta<T>["CreateInput"]
  ): InstanceType<T> {
    const instance = this.build(input);
    instance.save();
    return instance as InstanceType<T>;
  }

  /**
   * Checks if the model instance is persisted (not a new record and not destroyed).
   *
   * @template T - The type of the model.
   * @returns A boolean indicating whether the model instance is persisted.
   */
  isPersisted<T extends Model>(this: T): this is Persisted<T> {
    return !(this.isNewRecord || this.isDestroyed);
  }

  /**
   * Returns the model instance if it is persisted, otherwise returns undefined.
   *
   * @template T - The type of the model.
   * @returns The persisted instance of the model, or undefined if not persisted.
   */
  asPersisted<T extends Model>(this: T): Persisted<T> | undefined {
    return this.isPersisted() ? this : undefined;
  }

  /**
   * Saves the model instance.
   *
   * @template T - The type of the model.
   * @returns A boolean indicating whether the save operation was successful.
   */
  save<T extends Model>(this: T): this is Persisted<T> {
    const ret = this.createOrUpdate();
    this.isNewRecord = false;
    this.saveAssociations();
    this.storeOriginalValues();
    return ret;
  }

  /**
   * Updates the model instance with the provided data and saves it.
   *
   * @template T - The type of the model.
   * @param data - The data used to update the model instance.
   * @returns A boolean indicating whether the update operation was successful.
   */
  update<T extends Model>(
    this: T,
    input: Partial<Meta<T>["CreateInput"]>
  ): this is Persisted<T> {
    this.assignAttributes(input);
    return this.save();
  }

  /**
   * Deletes the record from the database.
   * @returns A boolean indicating whether the record was successfully deleted.
   */
  delete<T extends Model>(this: T): boolean {
    const ret = this.deleteRecord();
    this.isDestroyed = true;
    this.isReadonly = true;
    return ret;
  }

  /**
   * Destroys the record and its associated records from the database.
   * @returns A boolean indicating whether the record was successfully destroyed.
   * @throws An error if the record is readonly.
   */
  destroy<T extends Model>(this: T): boolean {
    if (this.isReadonly) throw new Error("Readonly record");
    for (const [key, association] of this.associations.entries()) {
      if (association instanceof HasOneAssociation) {
        association.destroy();
      }
      if (association instanceof HasManyAssociation) {
        const value = this[key as keyof T];
        if (value instanceof Collection) {
          value.destroyAll();
        }
      }
    }
    this.deleteRecord();
    this.isDestroyed = true;
    this.isReadonly = true;
    return true;
  }

  /**
   * Creates or updates the record in the database.
   * @returns A boolean indicating whether the record was successfully created or updated.
   * @throws An error if the record is readonly.
   */
  protected createOrUpdate<T extends Model>(this: T): boolean {
    if (this.isReadonly) {
      throw new Error("Readonly record");
    }
    return this.isNewRecord ? this.createRecord() : this.updateRecord();
  }

  /**
   * Updates the record in the database.
   * @returns A boolean indicating whether the record was successfully updated.
   */
  protected updateRecord<T extends Model>(this: T): boolean {
    if (this.isChanged()) {
      const data = this.makeUpdateParams();
      exec(this.queryBuilder.where(this.primaryKeysCondition()).update(data));
      this.retriveUpdatedAt(data);
    }
    return true;
  }

  /**
   * Creates the parameters for updating the record.
   * @returns The update parameters.
   */
  protected makeUpdateParams<T extends Model>(this: T) {
    const data: Record<string, any> = {};
    const now = new Date();
    for (const field of this.columnFields) {
      const column = field.dbName as keyof T;
      if (this.isAttributeChanged(field.name) && this[column] !== undefined) {
        data[column as string] = this[column];
      }
      if (this.findField(column as string)?.isUpdatedAt) {
        data[column as string] = now;
      }
      if (this.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this[column]);
      }
    }
    return data;
  }

  /**
   * Retrieves the updated attributes of the record from the database.
   * @param data - The updated data returned from the database.
   */
  protected retriveUpdatedAt<T extends Model>(
    this: T,
    data: Record<string, any>
  ) {
    for (const column of this.columns as (keyof T)[]) {
      if (this.findField(column as string)?.isUpdatedAt) {
        this[column as keyof T] = data[column as string];
      }
    }
  }

  /**
   * Creates the record in the database.
   * @returns A boolean indicating whether the record was successfully created.
   */
  protected createRecord<T extends Model>(this: T): boolean {
    const data = this.makeInsertParams();
    let q = this.queryBuilder;
    if (Model.connection.returningUsable()) {
      q = q.returning(this.primaryKeys);
    }
    const returning = exec(q.insert(data)) as Record<keyof T, any>[];
    this.retriveInsertedAttributes(returning[0] ?? {});
    return true;
  }

  /**
   * Retrieves the inserted attributes of the record from the database.
   * @param returning - The inserted data returned from the database.
   */
  protected retriveInsertedAttributes<T extends Model>(
    this: T,
    returning: Record<keyof T, any>
  ) {
    const data: Partial<T> = {};
    for (const key of this.primaryKeys as (keyof T)[]) {
      data[key] = this[key] || returning[key] || this.getLastInsertId();
    }
    const [record] = exec(this.queryBuilder.where(data).limit(1), "TRACE");
    for (const [key, value] of Object.entries(record)) {
      this[key as keyof T] = this.findField(key)?.cast(value) ?? value;
    }
  }

  // for MySQL (The 'returning' clause is not available.)
  protected getLastInsertId<T extends Model>(this: T) {
    return execSQL({
      sql: "select last_insert_id() as id;",
      bindings: [],
      logLevel: "TRACE",
    })[0]["id"];
  }

  /**
   * Creates the parameters for inserting the record.
   * @returns The insert parameters.
   */
  protected makeInsertParams<T extends Model>(this: T) {
    const data: any = {};
    const now = new Date();
    for (const column of this.columns as (keyof T)[]) {
      if (this[column] !== undefined) {
        data[column] = this[column];
      }
      const field = this.findField(column as string);
      if (field?.isUpdatedAt && data[column] == undefined) {
        data[column] = now;
      }
      if (field?.defaultIsNow && data[column] == undefined) {
        data[column] = now;
      }
      if (this.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this[column]);
      }
    }
    return data;
  }

  /**
   * Saves the associations of the record.
   */
  protected saveAssociations<T extends Model>(this: T) {
    for (const [key, association] of this.associations.entries()) {
      if (association instanceof HasOneAssociation) {
        association.persist();
      }
      if (association instanceof HasManyAssociation) {
        const value = this[key as keyof T];
        if (value instanceof Collection) {
          value.persist();
          value.resetOptions();
          value.reset();
        }
      }
    }
  }

  /**
   * Deletes the record from the database.
   * @returns A boolean indicating whether the record was successfully deleted.
   */
  protected deleteRecord<T extends Model>(this: T): boolean {
    exec(this.queryBuilder.where(this.primaryKeysCondition()).delete());
    return true;
  }

  /**
   * Creates the condition for the primary keys of the record.
   * @returns The primary keys condition.
   */
  protected primaryKeysCondition<T extends Model>(this: T) {
    const where = {} as Record<keyof T, any>;
    for (const key of this.primaryKeys as (keyof T)[]) {
      where[key] = this[key];
    }
    return where;
  }
}
