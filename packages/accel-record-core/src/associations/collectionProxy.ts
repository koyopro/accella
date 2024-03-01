import { ModelMeta, type Model } from "../index.js";
import { Relation } from "../relation.js";
import { HasManyAssociation } from "./hasManyAssociation";

export class CollectionProxy<T extends Model, S extends ModelMeta> extends Relation<
  T,
  S
> {
  constructor(
    model: typeof Model,
    private association: HasManyAssociation<T>,
    options: any,
    cache: T[] | undefined = undefined
  ) {
    super(model, options, cache);
  }

  push(record: T | T[]) {
    return this.concat(record);
  }

  concat(records: T | T[]) {
    console.log("concat", this.association);
    this.association.concat(records);
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
