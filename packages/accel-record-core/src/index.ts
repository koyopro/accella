import { CollectionProxy } from "./associations/collectionProxy.js";
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
  WhereInput: Record<string, SortOrder>;
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
    // Proxy
    const klass = this;
    const proxy = new Proxy(instance, {
      get(target, prop, receiver) {
        const assosiation = klass.assosiations[prop as any];
        if (assosiation && assosiation.foreignKey && assosiation.primaryKey && !assosiation.field.isList) {
          if (target[prop]) return target[prop];
          return target[prop] ||= Models[assosiation.klass].findBy({
            [assosiation.foreignKey]: target[assosiation.primaryKey],
          });
        }
        return Reflect.get(...arguments);
      },
      set(target, prop, value, receiver) {
        const assosiation = klass.assosiations[prop as any];
        if (
          assosiation && !assosiation.field.isList &&
          assosiation.foreignKey &&
          assosiation.primaryKey &&
          target[assosiation.primaryKey]
        ) {
          value[assosiation.foreignKey] = target[assosiation.primaryKey];
          value.save();
        }
        target[prop] = value;
        return true;
      },
    });
    for (const [key, assosiation] of Object.entries(this.assosiations)) {
      const { klass, foreignKey, primaryKey, field } = assosiation;
      if (!field.isList && key in input) {
        proxy[key] = input[key];
      } else if (field.isList || key in input) {
        const option = { wheres: [{ [foreignKey]: instance[primaryKey] }] };
        instance[key] = new CollectionProxy(
          Models[klass],
          option,
          input[key] ?? (instance.isPersisted() ? undefined : [])
        );
      }
    }
    return proxy;
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
