import { knex, rpcClient } from "../database";
import { Model } from "../index.js";
import { HasManyAssociation } from "./hasManyAssociation";

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/associations/has_many_through_association.rb
export class HasManyThroughAssociation<
  T extends Model,
> extends HasManyAssociation<T> {
  override concat<T>(records: T) {
    const _records = Array.isArray(records) ? records : [records];
    for (const record of _records) {
      Object.assign(record, this.scopeAttributes());
      record.save();
      // TODO: 中間テーブルの作成
      if (this.info.through) {
        const query = knex(this.info.through)
          .insert({
            ...this.scopeAttributes(),
            B: record.id,
          })
          .toSQL();
        rpcClient(query);
      }
    }
  }

  scopeAttributes() {
    return {
      [this.info.foreignKey]: this.owner[this.info.primaryKey as keyof T],
    };
  }
}
