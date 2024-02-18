import { knex, rpcClient } from "./database.js";
import { Model } from "./index.js";

export class Relation<T extends typeof Model> {
  private counter = 0;
  private cache: any[] | undefined = undefined;
  private client: any;
  constructor(private model: T, private options: any = {}) {
    this.model = model;
    this.client = model.client;
    this.options = options;
  }
  get(): T[] {
    const query = this.client.where(this.options.where ?? {}).toSQL();
    const rows = rpcClient({ type: "query", ...query });
    for (const { name, table, primaryKey, foreignKey } of this.options
      .includes ?? []) {
      const primaryKeys = rows.map((row: any) => row[primaryKey]);
      const query = knex.from(table).whereIn(foreignKey, primaryKeys).toSQL();
      const includeRows = rpcClient({ type: "query", ...query });
      const mapping: any = {};
      for (const row of includeRows) {
        if (!mapping[row[foreignKey]]) {
          mapping[row[foreignKey]] = [];
        }
        mapping[row[foreignKey]].push(row);
      }
      for (const row of rows) {
        row[name] = mapping[row[primaryKey]] ?? [];
      }
    }
    return rows.map((row: any) => this.model.build(row));
  }
  [Symbol.iterator]() {
    const that = this;
    return {
      next(): { value: T; done: boolean } {
        if (!that.cache) {
          that.cache = that.get();
        }
        const done = that.counter === that.cache!.length;
        const value = done ? undefined : that.cache![that.counter++];
        return { value, done };
      },
      return() {
        return { done: true, value: undefined };
      },
    };
  }
}
