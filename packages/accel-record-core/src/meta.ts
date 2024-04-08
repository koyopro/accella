import { Model, SortOrder } from "./index.js";

export type Meta<T> = ReturnType<typeof meta<T>>;
export type Persisted<T> = Meta<T>["Persisted"];
export type New<T> = Meta<T>["New"];

export type ModelMeta = {
  Base: Model;
  New: Model;
  Persisted: Model;
  AssociationKey: string;
  WhereInput: Record<string, any>;
  CreateInput: Record<string, any>;
  OrderInput: Record<string, SortOrder>;
};

export declare function meta<T>(model: T): ModelMeta;
