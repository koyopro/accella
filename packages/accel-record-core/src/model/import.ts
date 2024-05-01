import { Knex } from "knex";
import { exec } from "../database.js";
import { Meta, Model } from "../index.js";

type ImportOptions<T extends typeof Model> = {
  validate?: boolean | "throw";
  onDuplicateKeyUpdate?: true | (keyof Meta<T>["OrderInput"])[];
  conflictTarget?: (keyof Meta<T>["OrderInput"])[];
};

type ImportResult = {
  numInserts: number;
};

export class Import {
  static import<T extends typeof Model>(
    this: T,
    records: Meta<T>["Base"][] | Meta<T>["CreateInput"][],
    options: ImportOptions<T> = {}
  ): ImportResult {
    const _records = records.map((r) =>
      r instanceof Model ? r : this.build(r)
    );
    const params = _records
      .map((record) => {
        if (options.validate === false) return this.makeInsertParams(record);
        const isValid = record.isValid();
        if (options.validate === "throw" && !isValid)
          throw new Error("Validation failed");
        return isValid ? this.makeInsertParams(record) : undefined;
      })
      .filter(Boolean);
    let q = this.queryBuilder.insert(params);
    q = this.addOnConflictMerge<T>(options, q);
    const info = exec(q);
    return {
      numInserts: info.affectedRows ?? info.changes,
    };
  }

  private static addOnConflictMerge<T extends typeof Model>(
    this: T,
    options: ImportOptions<T>,
    q: Knex.QueryBuilder
  ) {
    if (options.onDuplicateKeyUpdate) {
      const attributes = options.onDuplicateKeyUpdate;
      const qb = Array.isArray(options.conflictTarget)
        ? q.onConflict(options.conflictTarget)
        : q.onConflict();
      if (attributes === true) q = qb.merge();
      else {
        const columns = attributes.map(
          (a) => this.attributeToColumn(a as string)!
        );
        q = qb.merge(columns);
      }
    }
    return q;
  }

  private static makeInsertParams(record: any) {
    return record.makeInsertParams();
  }
}
