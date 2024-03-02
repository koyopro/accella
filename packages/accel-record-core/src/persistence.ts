import { AssociationsBuilder } from "./associations/associationsBuilder";
import { rpcClient } from "./database";
import { CollectionProxy, Model } from "./index.js";

export class Persistence {
  isNewRecord: boolean = true;
  isReadonly: boolean = false;
  isDestroyed: boolean = false;

  static build<T extends typeof Model>(this: T, input: any) {
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

  static create<T extends typeof Model>(this: T, input: any) {
    const instance = this.build(input);
    instance.save();
    return instance;
  }

  isPersisted<T extends Model>(this: T): any {
    return (this.columnsForPersist as (keyof T)[]).every(
      (column: keyof T) => this[column] !== undefined
    );
  }

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

  destroy<T extends Model>(this: T): boolean {
    if (this.isReadonly) throw new Error("Readonly record");
    for (const [key, association] of Object.entries(this.associations)) {
      const value = this[key as keyof T] as any;
      if (value instanceof CollectionProxy) {
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
    rpcClient(query);
    for (const [key, association] of Object.entries(this.associations)) {
      const value = this[key as keyof T];
      if (association.through) {
        continue;
      }
      if (value instanceof CollectionProxy) {
        for (const instance of value.toArray()) {
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
    rpcClient(query);
    // FIXME: auto increment
    if (this.columns.includes("id")) {
      const q = this.client.orderBy("id", "desc").limit(1).toSQL();
      const [record] = rpcClient({ ...q, type: "query" });
      Object.assign(this, record);
    }
    for (const [key, association] of Object.entries(this.associations)) {
      const { foreignKey, primaryKey } = association;
      const value = this[key as keyof T];
      if (value instanceof CollectionProxy) {
        for (const instance of value) {
          instance[foreignKey] = this[primaryKey as keyof T];
          instance.save();
        }
        value.resetOptions();
        value.reset();
      } else if (association.isHasOne && value instanceof Model) {
        value[foreignKey] = this[primaryKey as keyof T];
        value.save();
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
