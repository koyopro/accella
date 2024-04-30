import { exec } from "../database.js";
import { Meta, Model } from "../index.js";

export class Import {
  static import<T extends typeof Model>(this: T, records: Meta<T>["Base"][]) {
    // @ts-ignore
    const params = records.map((record) => record.makeInsertParams());
    exec(this.queryBuilder.insert(params));
  }
}
