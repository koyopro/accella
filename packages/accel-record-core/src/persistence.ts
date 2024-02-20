import { Connection } from "./connection";
import { rpcClient } from "./database";
import { Fields } from "./fields";

export class Persistence {
  save<T extends Fields & Connection>(this: T): boolean {
    const data: any = {};
    for (const column of this.columns as (keyof T)[]) {
      if (this[column] !== undefined) {
        data[column as string] = this[column];
      }
    }
    const query = this.client.insert(data).toSQL();
    const id = rpcClient(query);
    (this as any).id = id;
    for (const [key, { foreignKey }] of Object.entries(this.assosiations)) {
      const value = this[key as keyof T];
      if (Array.isArray(value)) {
        for (const instance of value) {
          instance[foreignKey] = id;
          instance.save();
        }
      }
    }
    return true;
  }

  delete<T extends Fields & Connection>(this: T): boolean {
    const where = {} as Record<keyof T, any>;
    for (const key of this.primaryKeys as (keyof T)[]) {
      where[key] = this[key];
    }
    const query = this.client.where(where).delete().toSQL();
    rpcClient(query);
    return true;
  }
}
