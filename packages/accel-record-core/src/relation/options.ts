import { Association } from "../model/association.js";
import { LockType } from "../model/lock.js";

export type Options = {
  select: string[];
  joins: any[];
  joinsRaw: any[];
  conditions: Condition[];
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
  conditions: [],
  orders: [],
  offset: undefined,
  limit: undefined,
  lock: undefined,
});

/**
 * Represents a condition that can be used in a relation.
 *
 * @example
 * const condition: Condition = {
 *   __op__: "and",
 *   conditions: [
 *     { __op__: "hash", condition: { name: "foo" } },
 *     { __op__: "hashNot", condition: { id: 3 } },
 *     { __op__: "list", condition: ["id", ">", 10] },
 *     { __op__: "listNot", condition: ["age", ">", 10] },
 *     { __op__: "raw", query: "select 1", bindings: [] },
 *     {
 *       __op__: "or",
 *       conditions: [],
 *     },
 *   ],
 * };
 */
export type Condition =
  | HashCondition
  | HashNotCondition
  | ListCondition
  | ListNotCondition
  | RawCondition
  | AndCondition
  | OrCondition;

export type HashCondition = {
  __op__: "hash";
  condition: { [key: string]: any };
};

export type HashNotCondition = {
  __op__: "hashNot";
  condition: { [key: string]: any };
};

export type ListCondition = {
  __op__: "list";
  condition: any[];
};

export type ListNotCondition = {
  __op__: "listNot";
  condition: any[];
};

export type RawCondition = {
  __op__: "raw";
  query: string;
  bindings: any[];
};

export type OrCondition = {
  __op__: "or";
  conditions: Condition[];
};

export type AndCondition = {
  __op__: "and";
  conditions: Condition[];
};

export const hashCondition = (condition: { [key: string]: any }): HashCondition => ({
  __op__: "hash",
  condition,
});

export const hashNotCondition = (condition: { [key: string]: any }): HashNotCondition => ({
  __op__: "hashNot",
  condition,
});

export const listCondition = (condition: any[]): ListCondition => ({
  __op__: "list",
  condition,
});

export const listNotCondition = (condition: any[]): ListNotCondition => ({
  __op__: "listNot",
  condition,
});

export const rawCondition = (query: string, bindings: any[]): RawCondition => ({
  __op__: "raw",
  query,
  bindings,
});

export const andCondition = (conditions: Condition[]): AndCondition => ({
  __op__: "and",
  conditions,
});

export const orCondition = (conditions: Condition[]): OrCondition => ({
  __op__: "or",
  conditions,
});
