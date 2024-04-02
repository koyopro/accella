import type { Model, ModelMeta } from "./index.js";
import { Relation } from "./relation/index.js";

export class Query {
  static all<T extends typeof Model>(this: T): Relation<any, any> {
    return new Relation(this);
  }

  static findOrCreateBy<T extends typeof Model>(
    this: T,
    params: Parameters<typeof Model.create<T>>[0],
    callback?: (obj: InstanceType<T>) => void
  ): InstanceType<T> {
    const user = this.findBy(params);
    if (user) return user;
    const newUser = this.create(params);
    callback?.(newUser);
    return newUser;
  }

  static findOrInitializeBy<
    T extends typeof Model,
    S extends
      | ReturnType<typeof Model.build<T>>
      | ReturnType<typeof Model.create<T>>,
  >(
    this: T,
    params: Parameters<typeof Model.build<T>>[0],
    callback?: (obj: S) => void
  ): S {
    const user = this.findBy(params);
    if (user) return user;
    const newUser = this.build(params) as S;
    callback?.(newUser);
    return newUser;
  }

  static includes<
    T extends typeof Model,
    R extends ModelMeta["AssociationKey"][],
  >(this: T, ...input: R): Relation<any, any> {
    return this.all().includes(...input);
  }

  static joins<T extends typeof Model, R extends ModelMeta["AssociationKey"][]>(
    this: T,
    ...input: R
  ): Relation<any, any> {
    return this.all().joins(...input);
  }

  static joinsRaw<T extends typeof Model>(
    this: T,
    query: string,
    ...bindings: any[]
  ): Relation<any, any> {
    return this.all().joinsRaw(query, ...bindings);
  }

  static select<T extends typeof Model>(
    this: T,
    ...columns: string[]
  ): Relation<any, any> {
    return this.all().select(...columns);
  }

  static first<T extends typeof Model>(this: T) {
    return this.all().first();
  }

  static exists<T extends typeof Model>(this: T): boolean {
    return this.all().exists();
  }

  static isEmpty<T extends typeof Model>(this: T): boolean {
    return this.all().isEmpty();
  }

  static count<T extends typeof Model>(this: T): number {
    return this.all().count();
  }

  static order<T extends typeof Model>(
    this: T,
    attribute: string,
    direction: "asc" | "desc" = "asc"
  ) {
    return this.all().order(attribute, direction);
  }

  static offset<T extends typeof Model>(this: T, offset: number) {
    return this.all().offset(offset);
  }

  static limit<T extends typeof Model>(this: T, limit: number) {
    return this.all().limit(limit);
  }

  static where<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input);
  }

  static whereNot<T extends typeof Model>(this: T, input: object) {
    return this.all().whereNot(input);
  }

  static whereRaw<T extends typeof Model>(
    this: T,
    query: string,
    bindings: any[] = []
  ) {
    return this.all().whereRaw(query, bindings);
  }

  static find<T extends typeof Model>(this: T, id: number) {
    const instance = this.all()
      .setOption("wheres", [{ [this.primaryKeys[0]]: id }])
      .first();
    if (!instance) {
      throw new Error("Record Not found");
    }
    return instance as InstanceType<T>;
  }

  static findBy<T extends typeof Model>(this: T, input: object) {
    return this.all().where(input).first();
  }

  static maximum<T extends typeof Model>(this: T, attribute: string) {
    return this.all().maximum(attribute);
  }

  static minimum<T extends typeof Model>(this: T, attribute: string) {
    return this.all().minimum(attribute);
  }

  static average<T extends typeof Model>(this: T, attribute: string) {
    return this.all().average(attribute);
  }
}
