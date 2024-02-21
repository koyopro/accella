import { rpcClient } from "./database";
import type { Model } from "./index.js";

export class Persistence {
  isNewRecord: boolean = true;

  save<T extends Model>(this: T): boolean {
    const ret = createOrUpdate(this);
    this.isNewRecord = false;
    return ret;
  }

  update<T extends Model>(this: T, data: Partial<T>): boolean {
    this.assignAttributes(data);
    return this.save();
  }

  delete<T extends Model>(this: T): boolean {
    return deleteRecord(this);
  }
}

const createOrUpdate = <T extends Model>(obj: T): boolean => {
  // if (this.readonly) {
  //   throw new Error("Readonly record");
  // }
  // if (this.destroyed) {
  //   return false;
  // }
  return obj.isNewRecord ? createRecord(obj) : updateRecord(obj);
};

const updateRecord = <T extends Model>(obj: T): boolean => {
  const data: any = {};
  for (const column of obj.columns as (keyof T)[]) {
    if (obj[column] !== undefined) {
      data[column as string] = obj[column];
    }
  }
  const query = obj.client
    .where(primaryKeysCondition(obj))
    .update(data)
    .toSQL();
  const id = rpcClient(query);
  (obj as any).id = id;
  for (const [key, { foreignKey }] of Object.entries(obj.assosiations)) {
    const value = obj[key as keyof T];
    if (Array.isArray(value)) {
      for (const instance of value) {
        instance[foreignKey] = id;
        instance.save();
      }
    }
  }
  return true;
};

const createRecord = <T extends Model>(obj: T): boolean => {
  const data: any = {};
  for (const column of obj.columns as (keyof T)[]) {
    if (obj[column] !== undefined) {
      data[column as string] = obj[column];
    }
  }
  const query = obj.client.insert(data).toSQL();
  const id = rpcClient(query);
  (obj as any).id = id;
  for (const [key, { foreignKey }] of Object.entries(obj.assosiations)) {
    const value = obj[key as keyof T];
    if (Array.isArray(value)) {
      for (const instance of value) {
        instance[foreignKey] = id;
        instance.save();
      }
    }
  }
  return true;
};

const deleteRecord = <T extends Model>(obj: T): boolean => {
  const query = obj.client.where(primaryKeysCondition(obj)).delete().toSQL();
  rpcClient(query);
  return true;
};

const primaryKeysCondition = <T extends Model>(obj: T) => {
  const where = {} as Record<keyof T, any>;
  for (const key of obj.primaryKeys as (keyof T)[]) {
    where[key] = obj[key];
  }
  return where;
};
