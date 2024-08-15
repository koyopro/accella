import { Model } from "../index.js";

/**
 * Creates the condition for the primary keys of the record.
 * @returns The primary keys condition.
 */
export const primaryKeysCondition = <T extends Model>(record: T) => {
  const where = {} as Record<keyof T, any>;
  for (const key of record.primaryKeys as (keyof T)[]) {
    where[key] = record[key];
  }
  return where;
};
