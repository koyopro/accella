import { type Model } from "../index.js";
import { ModelMeta } from "../meta.js";
import { Options, Relation } from "../relation/index.js";
import { HasManyAssociation } from "./hasManyAssociation.js";

export class Collection<T extends Model, S extends ModelMeta> extends Relation<
  T,
  S
> {
  constructor(
    model: typeof Model,
    private association: HasManyAssociation<Model, S["Base"]>,
    cache: T[] | undefined = undefined
  ) {
    super(model, association.whereAttributes(), cache);
  }

  get length() {
    return this.cache?.length ?? this.count();
  }

  resetOptions() {
    for (const [key, value] of Object.entries(
      this.association.whereAttributes()
    )) {
      this.setOption(key as keyof Options, value);
    }
  }

  push(record: S["Base"] | S["Base"][]) {
    return this.concat(record);
  }

  concat(records: S["Base"] | S["Base"][]) {
    this.association.concat(records);
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      (this.cache ||= []).push(record as T);
    }
    return this;
  }

  isValid(): boolean | undefined {
    return this.cache?.every((r) => r.isValid());
  }

  persist() {
    this.association.persist(this.cache || []);
    return this;
  }

  deleteAll() {
    const ret = this.toArray();
    this.association.deleteAll();
    this.cache = [];
    return ret;
  }

  destroyAll() {
    const ret = this.toArray();
    this.association.destroyAll();
    this.cache = [];
    return ret;
  }

  delete(...records: S["Base"][]) {
    const ret = this.association.delete(...records);
    this.cache = this.cache?.filter((r) => !records.find((a) => a.equals(r)));
    return ret;
  }

  destroy(...records: S["Base"][]) {
    const ret = this.association.destroy(...records);
    this.cache = this.cache?.filter((r) => !records.find((a) => a.equals(r)));
    return ret;
  }

  replace(records: S["Base"][]) {
    const array = this.toArray();
    const added = records.filter((r) => !array.find((a) => a.equals(r as T)));
    const deleted = array.filter((a) => !records.find((r) => r.equals(a)));
    this.destroy(...deleted);
    this.concat(added);
    return this;
  }
}
