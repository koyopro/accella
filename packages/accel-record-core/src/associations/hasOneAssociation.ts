import { Model, Models } from "../index.js";
import { Association } from "./association.js";

export class HasOneAssociation<
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

  setter(record: T | undefined) {
    if (!record) {
      this.target?.destroy();
      this.target = undefined;
    } else {
      const prev = this.target;
      this.target = record;
      if (this.ownersPrimary && !this.persist()) {
        this.target = prev;
        return;
      }
    }
    this.isLoaded = true;
  }

  isValid() {
    return this.target?.isValid();
  }

  /**
   * Persists the associated target record by setting the foreign key value and saving the target record.
   * @returns {boolean} A boolean indicating whether the persistence was successful.
   */
  persist(): boolean {
    if (!this.target) return false;
    if (!this.ownersPrimary) return false;
    this.target[this.info.foreignKey as keyof T] = this.ownersPrimary as any;
    if (!this.target.isNewRecord && !this.target.isChanged()) return true;
    return this.target.save();
  }

  delete() {
    this.target?.delete();
  }

  destroy() {
    this.target?.destroy();
  }
}
