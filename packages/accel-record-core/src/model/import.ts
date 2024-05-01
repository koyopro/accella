import { exec } from "../database.js";
import { Meta, Model } from "../index.js";

export class Import {
  static import<T extends typeof Model>(
    this: T,
    records: Meta<T>["Base"][] | Meta<T>["CreateInput"][],
    options: {
      validate?: boolean | "throw";
      onDuplicateKeyUpdate?: true | (keyof Meta<T>["OrderInput"])[];
    } = {}
  ) {
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
    if (options.onDuplicateKeyUpdate) {
      const attributes = options.onDuplicateKeyUpdate;
      if (attributes === true) q = q.onConflict().merge();
      else {
        const columns = attributes.map(
          (a) => this.attributeToColumn(a as string)!
        );
        q = q.onConflict().merge(columns);
      }
    }
    exec(q);
  }

  private static makeInsertParams(record: any) {
    return record.makeInsertParams();
  }
}
