import { ModelMeta, type Model } from "../index.js";
import { Options, Relation } from "../relation.js";
import { HasManyAssociation } from "./hasManyAssociation.js";

export class CollectionProxy<
  T extends Model,
  S extends ModelMeta,
> extends Relation<T, S> {
  constructor(
    model: typeof Model,
    private association: HasManyAssociation<T>,
    cache: T[] | undefined = undefined
  ) {
    super(model, association.whereAttributes(), cache);
  }

  resetOptions() {
    for (const [key, value] of Object.entries(
      this.association.whereAttributes()
    )) {
      this.setOption(key as keyof Options, value);
    }
  }

  push(record: T | T[]) {
    return this.concat(record);
  }

  concat(records: T | T[]) {
    this.association.concat(records);
    (this.cache ||= []).push(...(Array.isArray(records) ? records : [records]));
    return this;
  }

  deleteAll() {
    const ret = this.toArray();
    this.association.deleteAll();
    this.reset();
    return ret;
  }

  destroyAll() {
    const ret = this.toArray();
    this.association.destroyAll();
    this.reset();
    return ret;
  }

  delete(...records: T[]) {
    const ret = this.association.delete(...records);
    this.reset();
    return ret;
  }

  destroy(...records: T[]) {
    const ret = this.association.destroy(...records);
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
