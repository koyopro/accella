import { type Model } from "./index.js";

export class Query {
  static first<T extends typeof Model>(this: T ): T | undefined {
    return this.all().first();
  }

  static exists<T extends typeof Model>(this: T): boolean {
    return this.all().exists();
  }

  static count<T extends typeof Model>(this: T): number {
    return this.all().count();
  }
}
