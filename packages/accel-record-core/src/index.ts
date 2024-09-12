import { Collection } from "./associations/collectionProxy.js";
import { HasManyAssociation } from "./associations/hasManyAssociation.js";
import { HasOneAssociation } from "./associations/hasOneAssociation.js";
import { Connection } from "./connection.js";
import { Fields } from "./fields.js";
import { ModelMeta } from "./meta.js";
import { ModelBase, RecordBase } from "./model/base.js";
import { Dirty } from "./model/dirty.js";
import { Import } from "./model/import.js";
import { Lock, LockType } from "./model/lock.js";
import { Searchable } from "./model/search.js";
import { Serialization } from "./model/serialization.js";
import { Validations } from "./model/validations.js";
import { Persistence } from "./persistence.js";
import { Query } from "./query.js";
import "./support.js";
import { Transaction } from "./transaction.js";
import { Mix } from "./utils.js";

export { Collection } from "./associations/collectionProxy.js";
export { after, before } from "./callbacks.js";
export { getConfig, initAccelRecord, stopRpcClient as stopWorker } from "./database.js";
export { Migration } from "./migration.js";
export { ModelBase } from "./model/base.js";
export { hasSecurePassword } from "./model/securePassword.js";
export { Relation } from "./relation/index.js";
export { scope } from "./scope.js";
export { DatabaseCleaner } from "./testUtils.js";
export { Rollback } from "./transaction.js";
export { Errors } from "./validation/errors.js";
export { Validator } from "./validation/validator/index.js";

export { Mix };

export type Meta<T> = ReturnType<typeof meta<T>>;

export declare function meta<T>(model: T): ModelMeta;

export type Filter<T> = {
  in?: T[];
  "<"?: T;
  ">"?: T;
  "<="?: T;
  ">="?: T;
};

export type StringFilter = Filter<string> & {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  like?: string;
};

export type OmitCreateInputKey<T, S extends string> = Omit<Meta<T>, "CreateInput"> & {
  CreateInput: Omit<Meta<T>["CreateInput"], S>;
};

export const Models: Record<string, typeof Model> = {};

export const registerModel = (model: any) => {
  Models[model.name] = model;
};

/**
 * Model for creating form objects
 */
export class FormModel extends Mix(ModelBase, Validations) {}

/**
 * Model for creating records
 */
export class Model extends Mix(
  RecordBase,
  Connection,
  Dirty,
  Fields,
  Import,
  Lock,
  Persistence,
  Query,
  Searchable,
  Serialization,
  Transaction,
  Validations
) {
  /**
   * Checks if the current instance is equal to another instance of the same type.
   * @param other The other instance to compare with.
   * @returns Returns `true` if the instances are equal, `false` otherwise.
   */
  equals<T extends Model>(this: T, other: T): boolean {
    if (this.constructor.name !== other.constructor.name) {
      return false;
    }
    for (const key of this.primaryKeys as (keyof T)[]) {
      if (this[key] == undefined || other[key] == undefined) return false;
      if (this[key] !== other[key]) return false;
    }
    return true;
  }

  /**
   * Reloads the record by resetting associations and attributes.
   * @returns The reloaded record.
   */
  reload(options?: { lock?: LockType }) {
    this.retriveInsertedAttributes({} as Record<keyof this, any>, options?.lock);
    for (const [key, association] of this.associations.entries()) {
      if (association instanceof HasOneAssociation) {
        association.reset();
      }
      if (association instanceof HasManyAssociation) {
        const value = this[key as keyof this];
        if (value instanceof Collection) {
          value.reset();
        }
      }
    }
    return this;
  }

  build<T extends PersistedModel, A extends keyof Meta<T>["Associations"] & string>(
    this: T,
    attribute: A,
    value: Partial<Meta<T>["Associations"][A]["CreateInput"]>
  ): Meta<T>["Associations"][A]["New"] {
    return this.associations.get(attribute)!.build(value);
  }

  create<T extends Model & { _persisted: true }, A extends keyof Meta<T>["Associations"] & string>(
    this: T,
    attribute: A,
    value: Meta<T>["Associations"][A]["CreateInput"]
  ): Meta<T>["Associations"][A]["Persisted"] {
    return this.associations.get(attribute)!.create(value);
  }

  reset<T extends Model, A extends keyof Meta<T>["Associations"] & string>(this: T, attribute: A) {
    return this.associations.get(attribute)!.reset();
  }
}

declare module "knex" {
  namespace Knex {
    interface QueryBuilder {
      execute(): any[];
    }
  }
}

type PersistedModel = Model & { __persisted: true };
