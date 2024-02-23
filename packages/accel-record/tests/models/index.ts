import { User } from './user.js'
export { User } from './user.js'
import { Post } from './post.js'
export { Post } from './post.js'
import { Setting } from './setting.js'
export { Setting } from './setting.js'
import { Model, Relation } from "accel-record-core";
import type { CollectionProxy } from "accel-record-core";

type SortOrder = "asc" | "desc";

type Filter<T> = {
  in?: T[];
  '<'?: T;
  '>'?: T;
  '<='?: T;
  '>='?: T;
};

type StringFilter = Filter<string> & {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};

declare module "./user" {
  namespace User {
    function create(input: UserCreateInput): PersistedUser;
    function first(): PersistedUser;
    function find(id: number): PersistedUser;
    function findBy(input: UserMeta['WhereInput']): PersistedUser | undefined;
    function all(): Relation<PersistedUser, UserMeta>;
    function order(column: keyof UserMeta["OrderInput"], direction?: "asc" | "desc"): Relation<PersistedUser, UserMeta>;
    function offset(offset: number): Relation<PersistedUser, UserMeta>;
    function limit(limit: number): Relation<PersistedUser, UserMeta>;
    function where(input: UserMeta['WhereInput']): Relation<PersistedUser, UserMeta>;
    function whereNot(input: UserMeta['WhereInput']): Relation<PersistedUser, UserMeta>;
    function whereRaw(query: string, bindings?: any[]): Relation<PersistedUser, UserMeta>;
    function build(input: Partial<UserCreateInput>): User;
    function includes<T extends readonly AssociationKey[]>(input: T): Relation<PersistedUser, UserMeta>;
  }
  interface User {
    /* columns */
    id: number | undefined;
    email: string;
    name: string | undefined;
    age: number | undefined;
    posts: CollectionProxy<Post, UserMeta>;
    setting: Setting | undefined;

    isPersisted<T extends Model>(this: T): this is PersistedUser;
    update(input: Partial<UserCreateInput>): boolean;
  }
  type UserCreateInput = {
    id?: number;
    email: string;
    name?: string;
    age?: number;
    posts?: Post[];
    setting?: Setting;
  };
  type UserMeta = {
    WhereInput: {
      id?: number | number[] | Filter<number> | null;
      email?: string | string[] | StringFilter | null;
      name?: string | string[] | StringFilter | null;
      age?: number | number[] | Filter<number> | null;
    };
    OrderInput: {
      id?: SortOrder;
      email?: SortOrder;
      name?: SortOrder;
      age?: SortOrder;
    };
  }
  type PersistedUser = User & {
    id: NonNullable<User["id"]>;
  };
  type AssociationKey = "posts";
}

declare module "./post" {
  namespace Post {
    function create(input: PostCreateInput): PersistedPost;
    function first(): PersistedPost;
    function find(id: number): PersistedPost;
    function findBy(input: PostMeta['WhereInput']): PersistedPost | undefined;
    function all(): Relation<PersistedPost, PostMeta>;
    function order(column: keyof PostMeta["OrderInput"], direction?: "asc" | "desc"): Relation<PersistedPost, PostMeta>;
    function offset(offset: number): Relation<PersistedPost, PostMeta>;
    function limit(limit: number): Relation<PersistedPost, PostMeta>;
    function where(input: PostMeta['WhereInput']): Relation<PersistedPost, PostMeta>;
    function whereNot(input: PostMeta['WhereInput']): Relation<PersistedPost, PostMeta>;
    function whereRaw(query: string, bindings?: any[]): Relation<PersistedPost, PostMeta>;
    function build(input: Partial<PostCreateInput>): Post;
    function includes<T extends readonly AssociationKey[]>(input: T): Relation<PersistedPost, PostMeta>;
  }
  interface Post {
    /* columns */
    id: number | undefined;
    title: string;
    content: string | undefined;
    published: boolean;
    authorId: number;

    isPersisted<T extends Model>(this: T): this is PersistedPost;
    update(input: Partial<PostCreateInput>): boolean;
  }
  type PostCreateInput = {
    id?: number;
    title: string;
    content?: string;
    published?: boolean;
    authorId: number;
  };
  type PostMeta = {
    WhereInput: {
      id?: number | number[] | Filter<number> | null;
      title?: string | string[] | StringFilter | null;
      content?: string | string[] | StringFilter | null;
      published?: boolean | boolean[] | undefined | null;
      authorId?: number | number[] | Filter<number> | null;
    };
    OrderInput: {
      id?: SortOrder;
      title?: SortOrder;
      content?: SortOrder;
      published?: SortOrder;
      authorId?: SortOrder;
    };
  }
  type PersistedPost = Post & {
    id: NonNullable<Post["id"]>;
  };
  type AssociationKey = "posts";
}

declare module "./setting" {
  namespace Setting {
    function create(input: SettingCreateInput): PersistedSetting;
    function first(): PersistedSetting;
    function find(id: number): PersistedSetting;
    function findBy(input: SettingMeta['WhereInput']): PersistedSetting | undefined;
    function all(): Relation<PersistedSetting, SettingMeta>;
    function order(column: keyof SettingMeta["OrderInput"], direction?: "asc" | "desc"): Relation<PersistedSetting, SettingMeta>;
    function offset(offset: number): Relation<PersistedSetting, SettingMeta>;
    function limit(limit: number): Relation<PersistedSetting, SettingMeta>;
    function where(input: SettingMeta['WhereInput']): Relation<PersistedSetting, SettingMeta>;
    function whereNot(input: SettingMeta['WhereInput']): Relation<PersistedSetting, SettingMeta>;
    function whereRaw(query: string, bindings?: any[]): Relation<PersistedSetting, SettingMeta>;
    function build(input: Partial<SettingCreateInput>): Setting;
    function includes<T extends readonly AssociationKey[]>(input: T): Relation<PersistedSetting, SettingMeta>;
  }
  interface Setting {
    /* columns */
    id: number | undefined;
    userId: number;
    threshold: number | undefined;
    createdAt: Date;

    isPersisted<T extends Model>(this: T): this is PersistedSetting;
    update(input: Partial<SettingCreateInput>): boolean;
  }
  type SettingCreateInput = {
    id?: number;
    userId: number;
    threshold?: number;
    createdAt?: Date;
  };
  type SettingMeta = {
    WhereInput: {
      id?: number | number[] | Filter<number> | null;
      userId?: number | number[] | Filter<number> | null;
      threshold?: number | number[] | Filter<number> | null;
      createdAt?: Date | Date[] | Filter<number> | null;
    };
    OrderInput: {
      id?: SortOrder;
      userId?: SortOrder;
      threshold?: SortOrder;
      createdAt?: SortOrder;
    };
  }
  type PersistedSetting = Setting & {
    id: NonNullable<Setting["id"]>;
  };
  type AssociationKey = "posts";
}
