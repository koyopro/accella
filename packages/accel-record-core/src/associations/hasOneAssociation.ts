import { Model, Models } from "../index.js";
import { Association } from "./association.js";

export class HasOneAssociation<
  O extends Model,
  T extends Model,
> extends Association<O, T> {
  reader() {
    if (!this.isLoaded) {
      this.target = Models[this.info.klass].findBy(this.scopeAttributes()) as
        | T
        | undefined;
      this.isLoaded = true;
    }
    return this.target;
  }

  setter(record: T | undefined) {
    if (!record) {
      this.target?.destroy();
      this.target = undefined;
    } else {
      this.target = record;
      this.persist();
    }
  }

  persist() {
    if (!this.target) return;
    const primary = this.owner[this.info.primaryKey as keyof O];
    if (!primary) return;
    this.target[this.info.foreignKey as keyof T] = primary as any;
    this.target.save();
  }

  delete() {
    this.target?.delete();
  }

  destroy() {
    this.target?.destroy();
  }
}
