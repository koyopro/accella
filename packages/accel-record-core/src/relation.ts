import { rpcClient } from "./database.js";
import { Models, type Meta, type Model } from "./index.js";

type Options = {
  wheres: any[];
  whereNots: any[];
  whereRaws: [string, any[]][];
  orders: [string, "asc" | "desc"][];
  offset: number | undefined;
  limit: number | undefined;
  includes: {
    klass: string;
    name: string;
    primaryKey: string;
    foreignKey: string;
  }[];
};

export class Relation<T, M extends Meta> {
  private counter = 0;
  private client: any;
  private options: Options;
  constructor(
    private model: typeof Model,
    options: Partial<Options> = {},
    private cache: any[] | undefined = undefined
  ) {
    this.model = model;
    this.client = model.client;
    this.options = Object.assign(
      {
        wheres: [],
        whereNots: [],
        whereRaws: [],
        orders: [],
        offset: undefined,
        limit: undefined,
      },
      options
    ) as Options;
  }
  toArray(): T[] {
    return (this.cache ||= this.get());
  }
  first(): T | undefined {
    if (this.cache) return this.cache[0];
    return new Relation<T, M>(this.model, {
      ...this.options,
      limit: 1,
    }).get()[0];
  }
  count(): number {
    const query = this.query().count("id").toSQL();
    const res = rpcClient({ type: "query", ...query });
    return Number(Object.values(res[0])[0]);
  }
  exists(): boolean {
    return this.first() !== undefined;
  }
  isEmpty(): boolean {
    return !this.exists();
  }
  offset(offset: number): Relation<T, M> {
    return new Relation(this.model, { ...this.options, offset });
  }
  limit(limit: number): Relation<T, M> {
    return new Relation(this.model, { ...this.options, limit });
  }
  order(
    column: keyof M["OrderInput"],
    direction: "asc" | "desc" = "asc"
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["orders"].push([column, direction]);
    return new Relation(this.model, newOptions);
  }
  where(input: M["WhereInput"]): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      if (Array.isArray(input[key])) {
        newOptions["wheres"].push([key, 'in', input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push([key, operator, input[key][operator]]);
        }
      } else {
        newOptions["wheres"].push({ [key]: input[key] });
      }
    }
    return new Relation(this.model, newOptions);
  }
  whereNot(input: M["WhereInput"]): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["wheres"].push([key, "not in", input[key][operator]]);
          } else {
            newOptions["whereNots"].push([key, operator, input[key][operator]]);
          }
        }
      } else {
        newOptions["whereNots"].push({ [key]: input[key] });
      }
    }
    return new Relation(this.model, newOptions);
  }
  whereRaw(query: string, bindings: any[] = []): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["whereRaws"].push([query, bindings]);
    return new Relation(this.model, newOptions);
  }
  query() {
    let q = this.client;
    for (const where of this.options.wheres) {
      if (Array.isArray(where)) {
        q = q.where(...where);
      } else {
        q = q.where(where);
      }
    }
    for (const where of this.options.whereNots) {
      if (Array.isArray(where)) {
        q = q.whereNot(...where);
      } else {
        q = q.whereNot(where);
      }
    }
    for (const [query, bindings] of this.options.whereRaws) {
      q = q.whereRaw(query, bindings);
    }
    if (this.options.limit) q = q.limit(this.options.limit);
    if (this.options.offset) q = q.offset(this.options.offset);
    for (const [column, direction] of this.options.orders ?? []) {
      q = q.orderBy(column, direction);
    }
    return q;
  }
  get(): T[] {
    const rows = rpcClient({ type: "query", ...this.query().toSQL() });
    for (const { klass, name, primaryKey, foreignKey } of this.options
      .includes ?? []) {
      const primaryKeys = rows.map((row: any) => row[primaryKey]);
      const included = Models[klass].where({
        [foreignKey]: { in: primaryKeys },
      });
      const mapping: any = {};
      for (const row of included) {
        (mapping[row[foreignKey]] ||= []).push(row);
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
