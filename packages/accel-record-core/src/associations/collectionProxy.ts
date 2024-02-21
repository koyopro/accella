import { Association } from "../fields";
import type { Model } from "../index.js";

export class CollectionProxy<T extends typeof Model, O extends Model> {
  constructor(
    private owner: O,
    private klass: T,
    private association: Association,
    private target: T[] | undefined = undefined
  ) {}

  toArray(): T[] {
    if (this.target == undefined) {
      this.target = this.klass
        .where({
          [this.association.foreignKey]:
            this.owner[this.association.primaryKey as keyof O],
        })
        .get();
    }
    return this.target!;
  }

  count() {
    return this.klass.count();
  }
}
