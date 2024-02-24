import { Meta, type Model } from "../index.js";
import { Relation } from "../relation.js";

export class CollectionProxy<T extends Model, S extends Meta> extends Relation<
  T,
  S
> {
  push(record: T | T[]) {
    return this.concat(record);
  }

  concat(records: T | T[]) {
    const _records = Array.isArray(records) ? records : [records];
    _records.forEach((record) => {
      Object.assign(record, this.options.wheres[0]);
      record.save();
    });
    return this.reset();
  }
}
