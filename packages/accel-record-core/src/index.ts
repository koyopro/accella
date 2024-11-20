import { DataSource } from "@prisma/generator-helper";
import { join } from "path";
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

export const Models: Record<string, typeof Model> = {};

export const registerModel = (model: any) => {
  Models[model.name] = model;
};

export const generateDatabaseConfig = (
  dataSource: DataSource,
  basePath: string,
  schemaDir: string
) => {
  let url: string | null = null;
  const prismaDir = join(basePath, schemaDir).replace("file:", "");
  if (dataSource.url.fromEnvVar) {
    const envVar = dataSource.url.fromEnvVar;
    url = (import.meta as any).env?.[envVar] ?? process.env?.[envVar] ?? null;
    if (url?.startsWith("file:")) {
      url = join(prismaDir, url.replace("file:", "")).replace("file:", "");
    }
  }
  return {
    type: dataSource.activeProvider as "mysql" | "sqlite" | "postgresql",
    datasourceUrl: url ?? dataSource.url.value ?? "",
    prismaDir,
  };
};

/**
 * Model for creating form objects
 */
export class FormModel extends Mix(ModelBase, Validations) {
  /**
   * Returns the model class for the current instance.
   */
  class<T extends typeof FormModel>(this: InstanceType<T>): T {
    return this.constructor as T;
  }
}

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
}

declare module "knex" {
  namespace Knex {
    interface QueryBuilder {
      execute(): any[];
    }
  }
}
