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
    for (const record of _records) {
      Object.assign(record, this.options.wheres[0]);
      record.save();
    }
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

  delete(...records: T[]) {
    const ret: T[] = [];
    const array = this.toArray();
    for (const record of records) {
      if (array.find((r) => r.equals(record))) {
        record.delete();
        ret.push(record);
      }
    }
    this.reset();
    return ret;
  }

  destroy(...records: T[]) {
    const ret: T[] = [];
    const array = this.toArray();
    for (const record of records) {
      if (array.find((r) => r.equals(record))) {
        record.destroy();
        ret.push(record);
      }
    }
    this.reset();
    return ret;
  }

  replace(records: T[]) {
    const array = this.toArray();
    const added = records.filter((r) => !array.find((a) => a.equals(r)));
    const deleted = array.filter((a) => !records.find((r) => r.equals(a)));
    this.destroy(...deleted);
    this.concat(added);
    return this.reset();
  }
}
