import { join } from "path";
import { knex, rpcClient } from "../database";
import { Association as Info } from "../fields";
import { Model } from "../index.js";
import { HasManyAssociation } from "./hasManyAssociation";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_through_association.rb
export class HasManyThroughAssociation<
  T extends Model,
> extends HasManyAssociation<T> {
  override concat(records: T | T[]) {
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      Object.assign(record, this.scopeAttributes());
      console.log("concat", record.id);
      record.save();
      console.log(record.id);
      // TODO: 中間テーブルの作成
      if (this.info.through) {
        const query = knex(this.info.through)
          .insert({
            ...this.scopeAttributes(),
            B: record.id,
          })
          .toSQL();
        console.log(query);
        rpcClient(query);
      }
    }
  }

  whereAttributes() {
    const joinKey = this.info.foreignKey == "A" ? "B" : "A";
    return {
      joins: [
        [
          this.info.through,
          `${this.info.field.type}.${this.info.primaryKey}`,
          "=",
          `${this.info.through}.${joinKey}`,
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
}
