import { Knex } from "knex";
import { exec } from "../database.js";
import { Meta, Model } from "../index.js";

/**
 * Options for importing data into a model.
 */
type ImportOptions<T extends typeof Model> = {
  /**
   * Specifies whether to validate the imported data.
   * - If not provided or set to `true`, the data will be validated.
   * - If set to `"throw"`, an error will be thrown if validation fails.
   * - If set to `false`, no validation will be performed.
   */
  validate?: boolean | "throw";

  /**
   * Specifies whether to update existing records when a duplicate key is encountered.
   * - If not provided or set to `true`, existing records will be updated.
   * - If set to an array of keys, only the specified keys will be updated.
   */
  onDuplicateKeyUpdate?: true | (keyof Meta<T>["Column"])[];

  /**
   * Specifies the conflict target for resolving conflicts when a duplicate key is encountered.
   * - If not provided, the entire record will be considered as the conflict target.
   * - If set to an array of keys, only the specified keys will be considered as the conflict target.
   */
  conflictTarget?: (keyof Meta<T>["Column"])[];
};

type ImportResult<T extends typeof Model> = {
  numInserts: number;
  failedInstances: Meta<T>["Base"][];
};

/**
 * Represents a class for Bulk Import.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Import {
  /**
   * Imports records into the database.
   * @param records - The records to import.
   * @param options - The import options.
   * @returns An object containing the number of inserts and any failed instances.
   */
  static import<T extends typeof Model>(
    this: T,
    records: Meta<T>["Base"][] | Meta<T>["CreateInput"][],
    options: ImportOptions<T> = {}
  ): ImportResult<T> {
    const _this = this as T & typeof Import;
    const _records = records.map((r) =>
      r instanceof Model ? r : this.build(r)
    );
    const failedInstances: Meta<T>["Base"][] = [];
    const params = _records
      .map((record) => {
        if (options.validate === false || record.isValid()) {
          return _this.makeInsertParams(record);
        }
        if (options.validate === "throw") {
          throw new Error("Validation failed");
        }
        failedInstances.push(record);
        return undefined;
      })
      .filter(Boolean);
    let q = this.queryBuilder.insert(params);
    q = _this.addOnConflictMerge<T>(options, q);
    const info = exec(q);
    return {
      numInserts: info.affectedRows ?? info.changes,
      failedInstances,
    };
  }

  /**
   * Adds the ON CONFLICT MERGE clause to the query.
   * @param options - The import options.
   * @param q - The query builder.
   * @returns The modified query builder.
   */
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

  /**
   * Creates the insert parameters for a record.
   * @param record - The record.
   * @returns The insert parameters.
   */
  private static makeInsertParams(record: any) {
    return record.makeInsertParams();
  }
}
