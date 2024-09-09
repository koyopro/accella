import { Meta, Model } from "./index.js";

export type { Meta };
export type Persisted<T> = Meta<T>["Persisted"];
export type New<T> = Meta<T>["New"];

export type ModelMeta = {
  Base: Model;
  New: Model;
  Persisted: Model;
  PrimaryKey: any;
  AssociationKey: string;
  Associations: any;
  JoinInput: any;
  Column: Record<string, any>;
  WhereInput: Record<string, any>;
  CreateInput: Record<string, any>;
};
