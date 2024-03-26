import { Relation } from "./index.js";
import { ModelMeta } from "../index.js";
import { exec } from "../database";

export class Query {
  reset(this: Relation<unknown, ModelMeta>) {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }
  count(this: Relation<unknown, ModelMeta>): number {
    const res = exec(this.query().count(this.model.primaryKeys[0]));
    return Number(Object.values(res[0])[0]);
  }
  exists(this: Relation<unknown, ModelMeta>): boolean {
    return this.first() !== undefined;
  }
  isEmpty(this: Relation<unknown, ModelMeta>): boolean {
    return !this.exists();
  }
}
