/* eslint-disable */
/***************************************************************
 * This file is automatically generated. Please do not modify.
 ***************************************************************/

import { AccountModel } from "./account.js";
import { registerModel, type Collection, type Filter, type StringFilter } from "accel-record";
import { Attribute, defineEnumTextAttribute } from "accel-record/enums";

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;

  interface Relation<T, M> {}
}

type Meta<T> = T extends typeof AccountModel | AccountModel ? AccountMeta : any;

declare module "./account" {
  interface AccountModel {
    id: number | undefined;
    email: string | undefined;
    passwordDigest: string | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
  }
}
export interface NewAccount extends AccountModel {}
export class Account extends AccountModel {}
export interface Account extends AccountModel {
  id: number;
  email: string;
  passwordDigest: string;
  createdAt: Date;
  updatedAt: Date;
}
type AccountAssociationKey = never;
type AccountCollection<T extends AccountModel> =
  | Collection<T, AccountMeta>
  | Collection<Account, AccountMeta>;
type AccountMeta = {
  Base: AccountModel;
  New: NewAccount;
  Persisted: Account;
  PrimaryKey: number;
  AssociationKey: AccountAssociationKey;
  JoinInput: AccountAssociationKey | AccountAssociationKey[];
  Column: {
    id: number;
    email: string;
    passwordDigest: string;
    createdAt: Date;
    updatedAt: Date;
  };
  CreateInput: {
    id?: number;
    email: string;
    passwordDigest?: string;
    password?: string;
    passwordConfirmation?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    email?: string | string[] | StringFilter | null;
    passwordDigest?: string | string[] | StringFilter | null;
    createdAt?: Date | Date[] | Filter<Date> | null;
    updatedAt?: Date | Date[] | Filter<Date> | null;
  };
};
registerModel(Account);
