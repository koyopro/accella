/* eslint-disable @typescript-eslint/no-unused-vars */
import { BelongsToAssociation } from "../associations/belongsToAssociation.js";
import { Collection } from "../associations/collectionProxy.js";
import { HasManyAssociation } from "../associations/hasManyAssociation.js";
import { HasOneAssociation } from "../associations/hasOneAssociation.js";
import { Model } from "../index.js";
import { Meta } from "../meta.js";

type RetriveModel<T> = undefined extends T
  ? NonNullable<T>
  : T extends Collection<infer U, infer S>
    ? U
    : T;

type ToUnion<T extends any[] | undefined> = undefined extends T ? never : NonNullable<T>[number];

type ToHashIncludeResult<K, T, O extends ToHashOptions<any>> = K extends keyof T
  ? undefined extends T[K]
    ? ToHashResult<NonNullable<T[K]>, O> | undefined // HasOne
    : T[K] extends Collection<infer U, infer S>
      ? ToHashResult<U, O>[] // HasMany
      : ToHashResult<T[K], O> // BelongsTo
  : {};

type ToHashInclude<O extends ToHashOptions<T>, T> = O["include"] extends string
  ? {
      [K in O["include"]]: ToHashIncludeResult<K, T, {}>;
    }
  : O["include"] extends ToHashIncludeOption<T>
    ? {
        [K in keyof O["include"]]: ToHashIncludeResult<
          K,
          T,
          // @ts-ignore
          NonNullable<O["include"][K]>
        >;
      }
    : {};

type ToHashMethods<O extends ToHashOptions<T>, T> = undefined extends O["methods"]
  ? {}
  : {
      [K in ToUnion<O["methods"]>]: T[Extract<K, keyof T>] extends () => any
        ? ReturnType<T[Extract<K, keyof T>]>
        : never;
    };

export type ToHashResult<T, O extends ToHashOptions<T>> = {
  [K in undefined extends O["only"]
    ? Exclude<keyof Meta<T>["Column"], ToUnion<O["except"]>>
    : ToUnion<O["only"]>]: T[Extract<K, keyof T>];
} & ToHashInclude<O, T> &
  ToHashMethods<O, T>;

type ToHashIncludeOption<T> = {
  [K in Meta<T>["AssociationKey"]]?: K extends keyof T ? ToHashOptions<RetriveModel<T[K]>> : never;
};

type NoArgMethods<T> = {
  [K in keyof T]: T[K] extends () => any ? K : never;
}[keyof T];

export type ToHashOptions<T> = {
  only?: (keyof Meta<T>["Column"])[];
  except?: (keyof Meta<T>["Column"])[];
  methods?: NoArgMethods<T>[];
  include?: Meta<T>["AssociationKey"] | ToHashIncludeOption<T>;
};

/**
 * Represents a Serialization class that provides methods for converting a model instance to a hash object.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Serialization {
  /**
   * Converts the model instance to a hash object.
   * @param options - The options for the conversion.
   * @returns The hash object representing the model instance.
   */
  toHash<T, O extends ToHashOptions<T>>(this: T, options?: O): ToHashResult<T, O>;
  toHash<T extends Model, O extends ToHashOptions<T>>(this: T, options: O = {} as O) {
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
        ret[key] = this.toHashInclude(key, value ?? {});
      }
    }
    for (const method of options.methods ?? []) {
      const f = this[method as keyof T];
      if (typeof f !== "function") continue;
      ret[method] = f.bind(this)();
    }
    return ret;
  }

  /**
   * Converts the associated model instance to a hash object.
   * @param key - The key of the association.
   * @param options - The options for the conversion.
   * @returns The hash object representing the associated model instance.
   */
  protected toHashInclude<T extends Model>(this: T, key: string, options: ToHashOptions<any>) {
    const association = this.associations.get(key);
    if (association instanceof HasManyAssociation) {
      return (this[key as keyof T] as any).map((r: Model) => r.toHash(options));
    }
    if (association instanceof HasOneAssociation || association instanceof BelongsToAssociation) {
      return (this[key as keyof T] as Model)?.toHash(options);
    }
    return undefined;
  }

  /**
   * Converts the model instance to a JSON string representation.
   *
   * @typeparam T - The type of the model.
   * @typeparam O - The type of the options for serialization.
   * @param options - The options for serialization.
   * @returns The JSON string representation of the model instance.
   */
  toJson<T extends Model, O extends ToHashOptions<T>>(this: T, options?: O): string {
    return JSON.stringify(this.toHash(options));
  }
}
