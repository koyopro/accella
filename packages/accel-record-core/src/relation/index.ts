import { exec } from "../database.js";
import { Model, type ModelMeta } from "../index.js";
import { classIncludes } from "../utils.js";
import { RelationBase } from "./base.js";
import { Options, getDefaultOptions } from "./options.js";
import { Query } from "./query.js";
import { Where } from "./where.js";

export { Options } from "./options.js";

export class Relation<T, M extends ModelMeta> extends classIncludes(
  Query,
  RelationBase,
  Where
) {
  protected counter = 0;
  protected queryBuilder: any;
  protected options: Options;
  constructor(
    protected model: typeof Model,
    options: Partial<Options> = {},
    protected cache: T[] | undefined = undefined
  ) {
    super();
    this.model = model;
    this.queryBuilder = model.queryBuilder;
    this.options = Object.assign(getDefaultOptions(), options) as Options;
  }
  toArray(): T[] {
    return (this.cache ||= this.load());
  }
  map<F extends (value: T, index: number, array: T[]) => any>(
    func: F
  ): ReturnType<F>[] {
    return this.toArray().map((row, i, array) => func(row, i, array));
  }
  select<
    F extends (keyof M["OrderInput"])[],
    // @ts-ignore
    R extends { [K in F[number]]: M["Persisted"][K] },
  >(...columns: F): Relation<T extends Model ? R : T & R, M> {
    return new Relation(this.model, {
      ...this.options,
      select: [...this.options.select, ...(columns as string[])],
    });
  }
  first(): T | undefined {
    if (this.cache) return this.cache[0];
    return new Relation<T, M>(this.model, {
      ...this.options,
      limit: 1,
    }).load()[0];
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

  where(input: M["WhereInput"]): Relation<T, M>;
  where(query: string, ...bindings: any[]): Relation<T, M>;
  where(
    queryOrInput: string | M["WhereInput"],
    ...bindings: any[]
  ): Relation<T, M> {
    if (typeof queryOrInput === "string") {
      return this.whereRaw(queryOrInput, ...bindings);
    }
    return new Relation(this.model, this.addWhere(queryOrInput));
  }
  whereNot(input: M["WhereInput"]): Relation<T, M> {
    return new Relation(this.model, this.addWhereNot(input));
  }
  whereRaw(query: string, ...bindings: any[]): Relation<T, M> {
    return new Relation(this.model, this.addWhereRaw(query, ...bindings));
  }
  includes(
    ...input: M["AssociationKey"][]
  ): Relation<T, M & { [K in M["AssociationKey"][number]]: ModelMeta }> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["includes"].push(
      ...input.map((key) => {
        return { name: key, ...this.model.associations[key] };
      })
    );
    return new Relation(this.model, newOptions);
  }
  minimum(attr: keyof M["OrderInput"]) {
    const res = exec(
      this.query().min(this.model.attributeToColumn(attr as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  maximum(attr: keyof M["OrderInput"]) {
    const res = exec(
      this.query().max(this.model.attributeToColumn(attr as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  average(attr: keyof M["OrderInput"]) {
    const res = exec(
      this.query().avg(this.model.attributeToColumn(attr as string))
    );
    return Number(Object.values(res[0])[0]);
  }
  load(): T[] {
    return this._load();
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
