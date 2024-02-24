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

  deleteAll() {
    const ret = this.toArray();
    for (const record of ret) {
      record.delete();
    }
    this.reset();
    return ret;
  }

  destroyAll() {
    const ret = this.toArray();
    for (const record of ret) {
      record.destroy();
    }
    this.reset();
    return ret;
  }
}
