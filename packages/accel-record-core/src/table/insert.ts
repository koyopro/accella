import { exec, execSQL } from "../database.js";
import { Model } from "../index.js";
import { affectLock, LockType } from "../model/lock.js";

export class InsertManager<T extends Model> {
  constructor(public record: T) {}

  insert() {
    const data = this.makeInsertParams();
    let q = this.record.queryBuilder;
    if (Model.connection.returningUsable()) {
      q = q.returning(this.record.primaryKeys);
    }
    const returning = exec(q.insert(data)) as Record<keyof T, any>[];
    this.retriveInsertedAttributes(returning[0] ?? {});
  }

  /**
   * Creates the parameters for inserting the record.
   * @returns The insert parameters.
   */
  makeInsertParams() {
    const data: any = {};
    const now = new Date();
    for (const column of this.record.columns as (keyof T)[]) {
      if (this.record[column] !== undefined) {
        data[column] = this.record[column];
      }
      const field = this.record.findField(column as string);
      if (field?.isUpdatedAt && data[column] == undefined) {
        data[column] = now;
      }
      if (field?.defaultIsNow && data[column] == undefined) {
        data[column] = now;
      }
      if (this.record.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this.record[column]);
      }
    }
    return data;
  }

  /**
   * Retrieves the inserted attributes of the record from the database.
   * @param returning - The inserted data returned from the database.
   */
  retriveInsertedAttributes(returning: Record<keyof T, any>, lock?: LockType) {
    const data: Partial<T> = {};
    for (const key of this.record.primaryKeys as (keyof T)[]) {
      data[key] = this.record[key] || returning[key] || this.getLastInsertId();
    }
    const q = affectLock(this.record.queryBuilder, lock).where(data).limit(1);
    const [record] = exec(q, "TRACE");
    for (const [key, value] of Object.entries(record)) {
      this.record[key as keyof T] = this.record.findField(key)?.cast(value) ?? value;
    }
  }

  // for MySQL (The 'returning' clause is not available.)
  protected getLastInsertId() {
    return execSQL({
      sql: "select last_insert_id() as id;",
      bindings: [],
      logLevel: "TRACE",
    })[0]["id"];
  }
}
