import { AssociationsBuilder } from "./associations/associationsBuilder";
import { AttributeAssignment } from "./attributeAssignment";
import { Connection } from "./connection";
import { Fields } from "./fields";
import { Persistence } from "./persistence";
import { Query } from "./query";
import { Relation } from "./relation.js";
import { classIncludes } from "./utils";

export { CollectionProxy } from "./associations/collectionProxy.js";
export { Relation } from "./relation.js";

type SortOrder = "asc" | "desc";
export type Meta = {
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
  Query
) {
  static build(input: any) {
    const instance: any = new this();
    instance.isNewRecord = true;
    for (const column of this.columns2) {
      if (column.columnDefault !== undefined) {
        instance[column.name] = column.columnDefault;
      }
      if (column.name in input) {
        instance[column.name] = input[column.name];
      }
    }
    return AssociationsBuilder.build(this as any, instance, input);
  }

  static create(input: any) {
    const instance = this.build(input);
    instance.save();
    return instance;
  }

  static all<T extends typeof Model>(this: T): Relation<any, any> {
    return new Relation(this);
  }

  static includes<T extends readonly any[]>(input: T): Relation<any, any> {
    const includes = input.map((key) => {
      return { name: key, ...this.associations[key] };
    });

    return new Relation(this, { includes });
  }

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

  isPersisted<T extends Model>(this: T): any {
    return (this.columnsForPersist as (keyof T)[]).every(
      (column: keyof T) => this[column] !== undefined
    );
  }
}
