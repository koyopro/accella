import { execSQL } from "../database";
import { Model } from "../index.js";
import { HasManyAssociation } from "./hasManyAssociation";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_through_association.rb
export class HasManyThroughAssociation<
  T extends Model,
> extends HasManyAssociation<T> {
  override concat(records: T | T[]) {
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      record.save();
      const query = this.connection
        .knex(this.info.through)
        .insert({
          ...this.scopeAttributes(),
          [this.joinKey]: record.pkValues[0],
        })
        .toSQL();
      execSQL(query);
    }
  }

  deleteAll() {
    const query = this.connection
      .knex(this.info.through)
      .where(this.info.foreignKey, this.owner[this.info.primaryKey as keyof T])
      .delete()
      .toSQL();
    execSQL(query);
  }

  destroyAll(): void {
    this.deleteAll();
  }

  delete(...records: T[]) {
    const ret: T[] = [];
    for (const record of records) {
      const query = this.connection
        .knex(this.info.through)
        .where(
          this.info.foreignKey,
          this.owner[this.info.primaryKey as keyof T]
        )
        .where(this.joinKey, record.pkValues[0])
        .delete()
        .toSQL();
      if (execSQL(query)) {
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
          [`${this.info.through}.${this.info.foreignKey}`]:
            this.owner[this.info.primaryKey as keyof T],
        },
      ],
    };
  }

  scopeAttributes() {
    return {
      [this.info.foreignKey]: this.owner[this.info.primaryKey as keyof T],
    };
  }

  private get joinKey() {
    return this.info.foreignKey == "A" ? "B" : "A";
  }
}
