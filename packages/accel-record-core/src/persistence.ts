import { ModelInstanceBuilder } from "./associations/modelInstanceBuilder.js";
import { exec, execSQL } from "./database.js";
import { Collection, Model } from "./index.js";

export class Persistence {
  isNewRecord: boolean = true;
  isReadonly: boolean = false;
  isDestroyed: boolean = false;

  static build<T extends typeof Model>(this: T, input: any) {
    return ModelInstanceBuilder.build(this as T, input);
  }

  static create<T extends typeof Model>(this: T, input: any) {
    const instance = this.build(input);
    instance.save();
    return instance;
  }

  isPersisted<T extends Model>(this: T): any {
    return !(this.isNewRecord || this.isDestroyed);
  }

  asPersisted<T extends Model>(this: T): T | undefined {
    return this.isPersisted() ? this : undefined;
  }

  save<T extends Model>(this: T): boolean {
    const ret = this.createOrUpdate();
    this.isNewRecord = false;
    this.saveAssociations();
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

  destroy<T extends Model>(this: T): boolean {
    if (this.isReadonly) throw new Error("Readonly record");
    for (const [key, association] of Object.entries(this.associationInfos)) {
      const value = this[key as keyof T] as any;
      if (value instanceof Collection) {
        value.destroyAll();
      } else if (association.isHasOne) {
        value?.destroy();
      }
    }
    this.deleteRecord();
    this.isDestroyed = true;
    this.isReadonly = true;
    return true;
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
    const data = this.makeUpdateParams();
    exec(this.client.where(this.primaryKeysCondition()).update(data));
    this.retriveUpdatedAt(data);
    return true;
  }

  protected makeUpdateParams<T extends Model>(this: T) {
    const data: any = {};
    const now = new Date();
    for (const column of this.columns as (keyof T)[]) {
      if (this[column] !== undefined) {
        data[column as string] = this[column];
      }
      if (this.findField(column as string)?.isUpdatedAt) {
        data[column as string] = now;
      }
      if (this.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this[column]);
      }
    }
    return data;
  }

  protected retriveUpdatedAt<T extends Model>(
    this: T,
    data: Record<string, any>
  ) {
    for (const column of this.columns as (keyof T)[]) {
      if (this.findField(column as string)?.isUpdatedAt) {
        this[column as keyof T] = data[column as string];
      }
    }
  }

  protected createRecord<T extends Model>(this: T): boolean {
    const data = this.makeInsertParams();
    let q = this.client.clone();
    if (Model.connection.returningUsable()) {
      q = q.returning(this.primaryKeys);
    }
    const returning = exec(q.insert(data)) as Record<keyof T, any>[];
    this.retriveInsertedAttributes(returning[0] ?? {});
    return true;
  }

  protected retriveInsertedAttributes<T extends Model>(
    this: T,
    returning: Record<keyof T, any>
  ) {
    const data: Partial<T> = {};
    for (const key of this.primaryKeys as (keyof T)[]) {
      data[key] = this[key] || returning[key] || this.getLastInsertId();
    }
    const [record] = exec(this.client.where(data).limit(1));
    for (const [key, value] of Object.entries(record)) {
      this[key as keyof T] = this.findField(key)?.cast(value) ?? value;
    }
  }

  // for MySQL (The 'returning' clause is not available.)
  protected getLastInsertId<T extends Model>(this: T) {
    return execSQL({
      sql: "select last_insert_id() as id;",
      bindings: [],
    })[0]["id"];
  }

  protected makeInsertParams<T extends Model>(this: T) {
    const data: any = {};
    const now = new Date();
    for (const column of this.columns as (keyof T)[]) {
      if (this[column] !== undefined) {
        data[column] = this[column];
      }
      const field = this.findField(column as string);
      if (field?.isUpdatedAt && data[column] == undefined) {
        data[column] = now;
      }
      if (field?.defaultIsNow && data[column] == undefined) {
        data[column] = now;
      }
      if (this.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this[column]);
      }
    }
    return data;
  }

  protected saveAssociations<T extends Model>(this: T) {
    for (const [key, association] of Object.entries(this.associationInfos)) {
      const { foreignKey, primaryKey } = association;
      const value = this[key as keyof T];
      if (value instanceof Collection) {
        value.persist();
        value.resetOptions();
        value.reset();
      } else if (association.isHasOne && value instanceof Model) {
        (value as any)[foreignKey] = this[primaryKey as keyof T];
        value.save();
      }
    }
  }

  protected deleteRecord<T extends Model>(this: T): boolean {
    exec(this.client.where(this.primaryKeysCondition()).delete());
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
