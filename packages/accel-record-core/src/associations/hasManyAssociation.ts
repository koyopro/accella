import { Model, Models } from "../index.js";
import { Association } from "./association.js";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_association.rb#L11
export class HasManyAssociation<
  O extends Model,
  T extends Model,
> extends Association<O, T> {
  concat(records: T | T[]) {
    return this.persist(records);
  }

  persist(records: T | T[]): boolean {
    const _records = Array.isArray(records) ? records : [records];
    let ret = true;
    for (const record of _records) {
      Object.assign(record, this.scopeAttributes());
      if (
        this.owner.isPersisted() &&
        (record.isChanged() || record.isNewRecord)
      ) {
        if (!record.save()) {
          ret = false;
        }
      }
    }
    return ret;
  }

  deleteAll() {
    Models[this.info.klass]
      .all()
      .setOption("wheres", [this.scopeAttributes()])
      .deleteAll();
  }

  destroyAll() {
    Models[this.info.klass]
      .all()
      .setOption("wheres", [this.scopeAttributes()])
      .destroyAll();
  }

  delete(...records: T[]) {
    const ret: T[] = [];
    for (const record of records) {
      if (record.delete()) {
        ret.push(record);
      }
    }
    return ret;
  }

  destroy(...records: T[]) {
    const ret: T[] = [];
    for (const record of records) {
      if (record.destroy()) {
        ret.push(record);
      }
    }
    return ret;
  }
}
