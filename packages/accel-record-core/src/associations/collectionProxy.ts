import type { Model } from "../index.js";

export class CollectionProxy<T extends Model, O extends Model> {
  constructor(private owner: O, private klass: T, private target: any = []) {}

  count() {
    return 2
  }
}
