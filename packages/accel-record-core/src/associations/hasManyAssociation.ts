import { Model } from "../index.js";
import { Association } from "./association";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_association.rb#L11
export class HasManyAssociation<T extends Model> extends Association<T> {
  concat<T>(records: T) {
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      Object.assign(record, this.scopeAttributes());
      record.save();
    }
  }

  scopeAttributes() {
    return {
      [this.info.foreignKey]: this.owner[this.info.primaryKey as keyof T],
    };
  }
}
