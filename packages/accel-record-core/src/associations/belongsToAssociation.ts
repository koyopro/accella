import { Model, Models } from "../index.js";
import { hashCondition } from "../relation/options.js";
import { Association } from "./association.js";

export class BelongsToAssociation<O extends Model, T extends Model> extends Association<O, T> {
  reader() {
    if (!this.isLoaded) {
      this.target = Models[this.info.klass]
        .all()
        .setOption("conditions", [hashCondition(this.scopeAttributes())])
        .first() as T | undefined;
      this.isLoaded = true;
    }
    return this.target;
  }

  setter(record: T) {
    this.target = record;
    for (let i = 0; i < this.info.foreignKeyColumns.length; i++) {
      this.owner[this.info.foreignKeyColumns[i] as keyof O] = record[
        this.info.primaryKeyColumns[i] as keyof T
      ] as any;
    }
    this.isLoaded = true;
  }

  override scopeAttributes() {
    return this.info.primaryKeyColumns.toHash((col, i) => [
      col,
      this.owner[this.info.foreignKeyColumns[i] as keyof O],
    ]);
  }
}
