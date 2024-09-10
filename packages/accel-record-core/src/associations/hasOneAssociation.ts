import { Model, Models, Rollback } from "../index.js";
import { Association } from "./association.js";

export class HasOneAssociation<O extends Model, T extends Model> extends Association<O, T> {
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
    if (this.ownerHasPrimary) this.reader();
    if (!record) {
      this.target?.destroy();
      this.target = undefined;
    } else if (!this.target?.equals(record)) {
      const prev = this.target;
      const success = Model.transaction(() => {
        this.target?.destroy();
        this.target = record;
        if (this.ownerHasPrimary && !this.persist()) {
          throw new Rollback();
        }
        return true;
      });
      if (!success) {
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
    if (!this.ownerHasPrimary) return false;
    this.info.foreignKeyColumns.forEach((column, i) => {
      this.target![column as keyof T] = this.owner[
        this.info.primaryKeyColumns[i] as keyof O
      ] as any;
    });
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
