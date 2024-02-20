import { AttributeAssignment } from "./attributeAssignment";
import { Connection } from "./connection";
import { rpcClient } from "./database";
import { Fields } from "./fields";

export class Persistence {
  isNewRecord: boolean = true;

  save<T extends Fields & Connection & Persistence>(this: T): boolean {
    const ret = createOrUpdate(this);
    this.isNewRecord = false;
    return ret;
  }

  update<T extends Fields & Connection & Persistence & AttributeAssignment>(
    this: T,
    data: Partial<T>
  ): boolean {
    this.assignAttributes(data);
    return this.save();
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

const createOrUpdate = <T extends Fields & Connection & Persistence>(
  obj: T
): boolean => {
  // if (this.readonly) {
  //   throw new Error("Readonly record");
  // }
  // if (this.destroyed) {
  //   return false;
  // }
  return obj.isNewRecord ? createRecord(obj) : updateRecord(obj);
};

const updateRecord = <T extends Fields & Connection & Persistence>(
  obj: T
): boolean => {
  const where = {} as Record<keyof T, any>;
  for (const key of obj.primaryKeys as (keyof T)[]) {
    where[key] = obj[key];
  }
  const data: any = {};
  for (const column of obj.columns as (keyof T)[]) {
    if (obj[column] !== undefined) {
      data[column as string] = obj[column];
    }
  }
  const query = obj.client.where(where).update(data).toSQL();
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

const createRecord = <T extends Fields & Connection>(obj: T): boolean => {
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
