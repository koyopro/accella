import { rpcClient } from "./database.js";
import { Models, type ModelMeta, type Model } from "./index.js";

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

export class Relation<T, M extends ModelMeta> {
  private counter = 0;
  private client: any;
  protected options: Options;
  constructor(
    private model: typeof Model,
    options: Partial<Options> = {},
    private cache: T[] | undefined = undefined
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
  map<F extends (value: T, index: number, array: T[]) => any>(
    func: F
  ): ReturnType<F>[] {
    return this.toArray().map((row, i, array) => func(row, i, array));
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
        newOptions["wheres"].push([key, "in", input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push(
            makeWhere(key, operator, input[key][operator])
          );
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
            newOptions["whereNots"].push(
              makeWhere(key, operator, input[key][operator])
            );
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
  deleteAll() {
    const query = this.query().del().toSQL();
    rpcClient(query);
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
    return rows.map((row: object) => {
      const obj = this.model.build(row);
      obj.isNewRecord = false;
      return obj;
    });
  }
  reset() {
    this.cache = undefined;
    this.counter = 0;
    return this;
  }
  [Symbol.iterator]() {
    const _this = this;
    return {
      next(): { value: T; done: boolean } {
        const done = _this.counter === _this.toArray().length;
        const value = (
          done ? undefined : _this.toArray()![_this.counter++]
        ) as T;
        return { value, done };
      },
      return() {
        return { done: true, value: undefined };
      },
    };
  }
}

const makeWhere = (key: string, operator: string, value: string) => {
  switch (operator) {
    case "startsWith":
      return [key, "like", `${value}%`];
    case "endsWith":
      return [key, "like", `%${value}`];
    case "contains":
      return [key, "like", `%${value}%`];
    default:
      return [key, operator, value];
  }
};
