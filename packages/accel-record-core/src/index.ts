import { AttributeAssignment } from "./attributeAssignment";
import { Connection } from "./connection";
import { rpcClient } from "./database.js";
import { Fields } from "./fields";
import { Persistence } from "./persistence";
import { Relation } from "./relation.js";
import { classIncludes } from "./utils";
import { CollectionProxy } from "./associations/collectionProxy.js";
import { Query } from "./query";

export { CollectionProxy } from "./associations/collectionProxy.js";
export { Relation } from "./relation.js";

type SortOrder = "asc" | "desc";
export type Meta = {
  WhereInput: Record<string, SortOrder>;
  OrderInput: Record<string, SortOrder>;
}

const Models: Record<string, typeof Model> = {};

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
    for (const [key, assosiation] of Object.entries(this.assosiations)) {
      const { klass, field } = assosiation;
      if (field.isList) {
        instance[key] = new CollectionProxy(instance, Models[klass], assosiation);
      }
      if (key in input) {
        console.log(key, input);
        const target = input[key].map((row: any) => Models[klass].build(row));
        instance[key] = new CollectionProxy(instance, Models[klass], assosiation, target);
      }
    }
    return instance;
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
      return { name: key, ...this.assosiations[key] };
    });

    return new Relation(this, { includes });
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
