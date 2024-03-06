import type { Model } from "./index.js";
import { Relation } from "./relation.js";

export class Query {
  static all<T extends typeof Model>(this: T): Relation<any, any> {
    return new Relation(this);
  }

  static includes<T extends typeof Model, R extends readonly any[]>(
    this: T,
    input: R
  ): Relation<any, any> {
    return this.all().includes(input);
  }

  static first<T extends typeof Model>(this: T) {
    return this.all().first();
  }

  static exists<T extends typeof Model>(this: T): boolean {
    return this.all().exists();
  }

  static isEmpty<T extends typeof Model>(this: T): boolean {
    return this.all().isEmpty();
  }

  static count<T extends typeof Model>(this: T): number {
    return this.all().count();
  }

  static order<T extends typeof Model>(
    this: T,
    column: string,
    direction: "asc" | "desc" = "asc"
  ) {
    return this.all().order(column, direction);
  }

  static offset<T extends typeof Model>(this: T, offset: number) {
    return this.all().offset(offset);
  }

  static limit<T extends typeof Model>(this: T, limit: number) {
    return this.all().limit(limit);
  }

  static where<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input);
  }

  static whereNot<T extends typeof Model>(this: T, input: object) {
    return this.all().whereNot(input);
  }

  static whereRaw<T extends typeof Model>(
    this: T,
    query: string,
    bindings: any[] = []
  ) {
    return this.all().whereRaw(query, bindings);
  }

  static find<T extends typeof Model>(this: T, id: number) {
    const instance = this.all().where({ id }).first();
    if (!instance) {
      throw new Error("Record Not found");
    }
    return instance;
  }

  static findBy<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input).first();
  }
}
