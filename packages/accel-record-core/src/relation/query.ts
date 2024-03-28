import { exec } from "../database.js";
import { Model, ModelMeta } from "../index.js";
import { Relation } from "./index.js";

export class Query {
  reset(this: Relation<unknown, ModelMeta>) {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }
  count(this: Relation<unknown, ModelMeta>): number {
    const res = exec(
      this.query().count(`${this.model.tableName}.${this.model.primaryKeys[0]}`)
    );
    return Number(Object.values(res[0])[0]);
  }
  exists(this: Relation<unknown, ModelMeta>): boolean {
    return this.first() !== undefined;
  }
  isEmpty(this: Relation<unknown, ModelMeta>): boolean {
    return !this.exists();
  }
  deleteAll(this: Relation<unknown, ModelMeta>) {
    exec(this.query().del());
  }
  destroyAll(this: Relation<unknown, ModelMeta>) {
    for (const record of this.toArray()) {
      if (record instanceof Model) record.destroy();
    }
  }
}
