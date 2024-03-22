import { Model, Models } from "../index.js";
import { Association } from "./association.js";

export class BelongsToAssociation<T extends Model> extends Association<T> {
  reader() {
    if (!this.isLoaded) {
      this.target = Models[this.info.klass].findBy(this.scopeAttributes()) as
        | T
        | undefined;
      this.isLoaded = true;
    }
    return this.target;
  }

  setter(record: T) {
    this.target = record;
    this.owner[this.info.foreignKey as keyof T] =
      record[this.info.primaryKey as keyof T];
  }

  override scopeAttributes() {
    return {
      [this.info.primaryKey]: this.owner[this.info.foreignKey as keyof T],
    };
  }

  persist(records: T | T[]) {
    // TODO: implement
  }

  delete(...records: T[]) {
    // TODO: implement
  }

  destroy(...records: T[]) {
    // TODO: implement
  }
}
