import { Model, Models } from "../index.js";
import { Association } from "./association.js";

export class BelongsToAssociation<
  O extends Model,
  T extends Model,
> extends Association<O, T> {
  reader() {
    if (!this.isLoaded) {
      this.target = Models[this.info.klass]
        .all()
        .setOption("wheres", [this.scopeAttributes()])
        .first() as T | undefined;
      this.isLoaded = true;
    }
    return this.target;
  }

  setter(record: T) {
    this.target = record;
    this.owner[this.info.foreignKey as keyof O] = record[
      this.info.primaryKey as keyof T
    ] as any;
  }

  override scopeAttributes() {
    return {
      [this.info.primaryKey]: this.owner[this.info.foreignKey as keyof O],
    };
  }
}
