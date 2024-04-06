import { Model } from "../index.js";
import { BelongsToAssociation } from "../associations/belongsToAssociation.js";
import { HasManyAssociation } from "../associations/hasManyAssociation.js";
import { HasOneAssociation } from "../associations/hasOneAssociation.js";

type ToHashOptions = {
  only?: string[];
  except?: string[];
  methods?: string[];
  include?: string | { [key: string]: ToHashOptions };
};

export class Serialization {
  toHash<T extends Model>(this: T, options: ToHashOptions = {}) {
    const ret = {} as any;
    for (const field of this.columnFields) {
      if (options.only && !options.only.includes(field.name)) continue;
      if (options.except && options.except.includes(field.name)) continue;

      ret[field.name] = this[field.dbName as keyof T] ?? undefined;
    }
    if (typeof options.include === "string") {
      ret[options.include] = this.toHashInclude(options.include, {});
    }
    if (typeof options.include === "object") {
      for (const [key, value] of Object.entries(options.include)) {
        ret[key] = this.toHashInclude(key, value);
      }
    }
    for (const method of options.methods ?? []) {
      const f = this[method as keyof T];
      if (typeof f !== "function") continue;
      ret[method] = f.bind(this)();
    }
    return ret;
  }

  protected toHashInclude<T extends Model>(
    this: T,
    key: string,
    options: ToHashOptions
  ) {
    const association = this.associations.get(key);
    if (association instanceof HasManyAssociation) {
      return (this[key as keyof T] as any).map((r: Model) => r.toHash(options));
    }
    if (
      association instanceof HasOneAssociation ||
      association instanceof BelongsToAssociation
    ) {
      return (this[key as keyof T] as Model)?.toHash(options);
    }
    return undefined;
  }
}
