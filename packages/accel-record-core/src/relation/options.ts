import { Association } from "../fields.js";

export type Options = {
  select: string[];
  joins: any[];
  joinsRaw: any[];
  wheres: any[];
  whereNots: any[];
  whereRaws: [string, any[]][];
  orders: [string, "asc" | "desc"][];
  offset: number | undefined;
  limit: number | undefined;
  includes: (Association & {
    name: string;
  })[];
};

export const getDefaultOptions = (): Options => ({
  select: [],
  joins: [],
  joinsRaw: [],
  includes: [],
  wheres: [],
  whereNots: [],
  whereRaws: [],
  orders: [],
  offset: undefined,
  limit: undefined,
});
