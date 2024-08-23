import { exec } from "../database.js";
import { Model } from "../index.js";
import { primaryKeysCondition } from "./utils.js";

export class UpdateManager<T extends Model> {
  constructor(public record: T) {}

  update() {
    const data = this.makeUpdateParams();
    exec(this.record.queryBuilder.where(primaryKeysCondition(this.record)).update(data));
    this.retriveUpdatedAt(data);
  }

  /**
   * Creates the parameters for updating the record.
   * @returns The update parameters.
   */
  protected makeUpdateParams() {
    const data: Record<string, any> = {};
    const now = new Date();
    for (const field of this.record.columnFields) {
      const column = field.dbName as keyof T;
      if (this.record.isAttributeChanged(field.name) && this.record[column] !== undefined) {
        data[column as string] = this.record[column];
      }
      if (this.record.findField(column as string)?.isUpdatedAt) {
        data[column as string] = now;
      }
      if (this.record.findField(column as string)?.type === "Json") {
        data[column as string] = JSON.stringify(this.record[column]);
      }
    }
    return data;
  }

  /**
   * Retrieves the updated attributes of the record from the database.
   * @param data - The updated data returned from the database.
   */
  protected retriveUpdatedAt(data: Record<string, any>) {
    for (const column of this.record.columns as (keyof T)[]) {
      if (this.record.findField(column as string)?.isUpdatedAt) {
        this.record[column as keyof T] = data[column as string];
      }
    }
  }
}
