import { rpcClient } from "./database";
import type { Model } from "./index.js";

export class Persistence {
  isNewRecord: boolean = true;
  isReadonly: boolean = false;
  isDestroyed: boolean = false;

  save<T extends Model>(this: T): boolean {
    const ret = this.createOrUpdate();
    this.isNewRecord = false;
    return ret;
  }

  update<T extends Model>(this: T, data: object): boolean {
    this.assignAttributes(data);
    return this.save();
  }

  delete<T extends Model>(this: T): boolean {
    const ret = this.deleteRecord();
    this.isDestroyed = true;
    this.isReadonly = true;
    return ret;
  }

  protected createOrUpdate<T extends Model>(this: T): boolean {
    if (this.isReadonly) {
      throw new Error("Readonly record");
    }
    // if (this.destroyed) {
    //   return false;
    // }
    return this.isNewRecord ? this.createRecord() : this.updateRecord();
  }

  protected updateRecord<T extends Model>(this: T): boolean {
    const data: any = {};
    for (const column of this.columns as (keyof T)[]) {
      if (this[column] !== undefined) {
        data[column as string] = this[column];
      }
    }
    const query = this.client
      .where(this.primaryKeysCondition())
      .update(data)
      .toSQL();
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

  protected createRecord<T extends Model>(this: T): boolean {
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

  protected deleteRecord<T extends Model>(this: T): boolean {
    const query = this.client
      .where(this.primaryKeysCondition())
      .delete()
      .toSQL();
    rpcClient(query);
    return true;
  }

  protected primaryKeysCondition<T extends Model>(this: T) {
    const where = {} as Record<keyof T, any>;
    for (const key of this.primaryKeys as (keyof T)[]) {
      where[key] = this[key];
    }
    return where;
  }
}
