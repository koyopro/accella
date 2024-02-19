import { Connection } from "./connection";
import { rpcClient } from "./database.js";
import { Fields } from "./fields";
import { Relation } from "./relation.js";
import { classIncludes } from "./utils";

const Models: Record<string, typeof Model> = {};

export const registerModel = (model: any) => {
  Models[model.name] = model;
};

export class Model extends classIncludes(Connection, Fields) {
  static build(input: any) {
    const instance: any = new this();
    for (const column of this.columns2) {
      if (column.columnDefault !== undefined) {
        instance[column.name] = column.columnDefault;
      }
      if (column.name in input) {
        instance[column.name] = input[column.name];
      }
    }
    for (const [key, { klass, field }] of Object.entries(this.assosiations)) {
      if (field.isList) {
        instance[key] = [];
      }
      if (key in input) {
        instance[key] = input[key].map((row: any) => Models[klass].build(row));
      }
    }
    return instance;
  }

  static create(input: any) {
    const instance = this.build(input);
    instance.save();
    return instance;
  }

  static find(id: number) {
    const query = this.client.where({ id }).toSQL();
    const [instance] = rpcClient({ type: "query", ...query });

    if (!instance) {
      throw new Error("Record Not found");
    }
    return this.build(instance);
  }

  static findBy(input: any) {
    const query = this.client.where(input).toSQL();
    const [instance] = rpcClient({ type: "query", ...query });
    if (!instance) {
      return undefined;
    }
    return this.build(instance);
  }

  static all<T extends typeof Model>(this: T): Relation<any> {
    return new Relation(this);
  }

  static count(): number {
    const query = this.client.count("id").toSQL();
    const res = rpcClient({ type: "query", ...query });
    return Number(Object.values(res[0])[0]);
  }

  static where<T extends typeof Model>(this: T, input: any): Relation<any> {
    return new Relation(this, { where: input });
  }

  static includes<T extends readonly any[]>(input: T): Relation<any> {
    const includes = input.map((key) => {
      return { name: key, ...this.assosiations[key] };
    });

    return new Relation(this, { includes });
  }

  save(): boolean {
    const data: any = {};
    for (const column of this.columns as (keyof this)[]) {
      if (this[column] !== undefined) {
        data[column as string] = this[column];
      }
    }
    const query = this.client.insert(data).toSQL();
    const id = rpcClient(query);
    (this as any).id = id;
    for (const [key, { foreignKey }] of Object.entries(this.assosiations)) {
      const value = this[key as keyof this];
      if (Array.isArray(value)) {
        for (const instance of value) {
          instance[foreignKey] = id;
          instance.save();
        }
      }
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
