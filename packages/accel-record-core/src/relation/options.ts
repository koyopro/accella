import { Association } from "../model/association.js";
import { LockType } from "../model/lock.js";

export type Options = {
  select: string[];
  joins: any[];
  joinsRaw: any[];
  wheres: any[];
  whereNots: any[];
  whereRaws: [string, any[]][];
  orWheres: any[];
  orWhereNots: any[];
  orders: [string, "asc" | "desc"][];
  offset: number | undefined;
  limit: number | undefined;
  includes: Association[];
  lock: LockType;
};

export const getDefaultOptions = (): Options => ({
  select: [],
  joins: [],
  joinsRaw: [],
  includes: [],
  wheres: [],
  whereNots: [],
  whereRaws: [],
  orWheres: [],
  orWhereNots: [],
  orders: [],
  offset: undefined,
  limit: undefined,
  lock: undefined,
});
