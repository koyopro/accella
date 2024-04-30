import { exec } from "../database.js";
import { Meta, Model } from "../index.js";

export class Import {
  static import<T extends typeof Model>(
    this: T,
    records: Meta<T>["Base"][],
    options: {
      validate?: boolean | "throw";
      onDuplicateKeyUpdate?: true | (keyof Meta<T>["OrderInput"])[];
    } = {}
  ) {
    const params = records
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
      const columns = options.onDuplicateKeyUpdate;
      if (columns === true) q = q.onConflict().merge();
      else q = q.onConflict().merge(columns);
    }
    exec(q);
  }

  private static makeInsertParams(record: any) {
    return record.makeInsertParams();
  }
}
