import { Model, Models } from "../index.js";
import { Association } from "./association";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_association.rb#L11
export class HasManyAssociation<T extends Model> extends Association<T> {
  concat(records: T | T[]) {
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      Object.assign(record, this.scopeAttributes());
      if (this.owner.isPersisted()) {
        record.save();
      }
    }
  }

  deleteAll() {
    Models[this.info.klass].where(this.scopeAttributes()).deleteAll();
  }

  destroyAll() {
    Models[this.info.klass].where(this.scopeAttributes()).destroyAll();
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
