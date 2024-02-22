import { type Model } from "./index.js";

export class Query {
  static first<T extends typeof Model>(this: T ): T | undefined {
    return this.all().first();
  }
}
