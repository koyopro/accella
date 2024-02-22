import type { Model } from "./index.js";

export class Query {
  static first<T extends typeof Model>(this: T): T | undefined {
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
}
