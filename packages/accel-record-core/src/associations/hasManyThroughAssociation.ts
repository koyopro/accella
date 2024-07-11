import { exec } from "../database.js";
import { Model } from "../index.js";
import { HasManyAssociation } from "./hasManyAssociation.js";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_through_association.rb
export class HasManyThroughAssociation<
  O extends Model,
  T extends Model,
> extends HasManyAssociation<O, T> {
  override concat(records: T | T[]) {
    return this.persist(records);
  }

  persist(records: T | T[]): boolean {
    const _records = Array.isArray(records) ? records : [records];
    let ret = true;
    for (const record of _records) {
      if (!this.owner.isPersisted()) continue;
      if (!record.save()) ret = false;
      const query = this.connection
        .knex(this.info.through)
        .insert({
          ...this.scopeAttributes(),
          [this.joinKey]: record.pkValues[0],
        })
        .onConflict([this.info.foreignKey, this.joinKey])
        .ignore();
      exec(query);
    }
    return ret;
  }

  deleteAll() {
    const query = this.connection
      .knex(this.info.through)
      .where(this.info.foreignKey, this.ownersPrimary as any)
      .delete();
    exec(query);
  }

  destroyAll(): void {
    this.deleteAll();
  }

  delete(...records: T[]) {
    const ret: T[] = [];
    for (const record of records) {
      const query = this.connection
        .knex(this.info.through)
        .where(this.info.foreignKey, this.ownersPrimary as any)
        .where(this.joinKey, record.pkValues[0])
        .delete();
      if (exec(query)) {
        ret.push(record);
      }
    }
    return ret;
  }

  destroy(...records: T[]): T[] {
    return this.delete(...records);
  }

  whereAttributes() {
    return {
      joins: [
        [
          this.info.through,
          `${this.info.field.type}.${this.info.primaryKey}`,
          "=",
          `${this.info.through}.${this.joinKey}`,
        ],
      ],
      wheres: [
        {
          [`${this.info.through}.${this.info.foreignKey}`]: this.ownersPrimary,
        },
      ],
    };
  }

  scopeAttributes() {
    return {
      [this.info.foreignKey]: this.ownersPrimary,
    };
  }

  private get joinKey() {
    return this.info.joinKey;
  }
}
