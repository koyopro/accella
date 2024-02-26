import { AttributeAssignment } from "./attributeAssignment";
import { Connection } from "./connection";
import { Fields } from "./fields";
import { Persistence } from "./persistence";
import { Query } from "./query";
import { Transaction } from "./transaction";
import { classIncludes } from "./utils";

export { CollectionProxy } from "./associations/collectionProxy.js";
export { getPrismaClientConfig, stopRpcClient } from "./database.js";
export { Relation } from "./relation.js";
export { Rollback } from "./transaction.js";

export type SortOrder = "asc" | "desc";

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

export type ModelMeta = {
  WhereInput: Record<string, any>;
  OrderInput: Record<string, SortOrder>;
};

export const Models: Record<string, typeof Model> = {};

export const registerModel = (model: any) => {
  Models[model.name] = model;
};

export class Model extends classIncludes(
  AttributeAssignment,
  Connection,
  Fields,
  Persistence,
  Query,
  Transaction
) {
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

  serialize(): Record<string, unknown> {
    const ret: Record<string, unknown> = {
      _className: this.constructor.name,
    };
    for (const column of this.columns as (keyof this)[]) {
      ret[column as string] = this[column];
    }
    return ret;
  }
}
