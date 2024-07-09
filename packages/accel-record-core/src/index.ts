import "./support.js";
import { Association } from "./associations/association.js";
import { Collection } from "./associations/collectionProxy.js";
import { HasManyAssociation } from "./associations/hasManyAssociation.js";
import { HasOneAssociation } from "./associations/hasOneAssociation.js";
import { AttributeAssignment } from "./attributeAssignment.js";
import { Callbacks } from "./callbacks.js";
import { Connection } from "./connection.js";
import { Fields } from "./fields.js";
import { ModelMeta } from "./meta.js";
import { Dirty } from "./model/dirty.js";
import { Import } from "./model/import.js";
import { Naming } from "./model/naming.js";
import { Serialization } from "./model/serialization.js";
import { Validations } from "./model/validations.js";
import { Persistence } from "./persistence.js";
import { Query } from "./query.js";
import { Transaction } from "./transaction.js";
import { Mix } from "./utils.js";

export { Collection } from "./associations/collectionProxy.js";
export {
  getConfig,
  initAccelRecord,
  stopRpcClient as stopWorker,
} from "./database.js";
export { Migration } from "./migration.js";
export { Relation } from "./relation/index.js";
export { DatabaseCleaner } from "./testUtils.js";
export { Rollback } from "./transaction.js";
export { Errors } from "./validation/errors.js";
export { Validator } from "./validation/validator/index.js";
export { before, after } from "./callbacks.js";
export { hasSecurePassword } from "./model/securePassword.js";

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

export const Models: Record<string, typeof Model> = {};

export const registerModel = (model: any) => {
  Models[model.name] = model;
};

export class Model extends Mix(
  AttributeAssignment,
  Callbacks,
  Connection,
  Dirty,
  Fields,
  Import,
  Naming,
  Persistence,
  Query,
  Serialization,
  Transaction,
  Validations
) {
  associations: Map<string, Association<Model, Model>> = new Map();

  /**
   * Returns the model class for the current instance.
   *
   * @returns The model class.
   */
  class<T extends typeof Model>(this: InstanceType<T>): T {
    return this.constructor as T;
  }

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
  reload() {
    this.retriveInsertedAttributes({} as Record<keyof this, any>);
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
}

declare module "knex" {
  namespace Knex {
    interface QueryBuilder {
      execute(): any[];
    }
  }
}
