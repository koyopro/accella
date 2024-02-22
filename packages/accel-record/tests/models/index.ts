import { User } from './user.js'
export { User } from './user.js'
import { Post } from './post.js'
export { Post } from './post.js'
import { Model, Relation } from "accel-record-core";
import type { CollectionProxy } from "accel-record-core";
import { Prisma } from "@prisma/client";

type SortOrder = "asc" | "desc";

type Compare<T> = {
  in?: T[];
  '<'?: T;
  '>'?: T;
  '<='?: T;
  '>='?: T;
};

declare module "./user" {
  namespace User {
    function create(input: UserCreateInput): PersistedUser;
    function find(id: number): PersistedUser;
    function findBy(input: Prisma.UserWhereInput): PersistedUser | undefined;
    function all(): Relation<PersistedUser, UserMeta>;
    function order(column: keyof UserMeta["OrderInput"], direction?: "asc" | "desc"): Relation<PersistedUser, UserMeta>;
    function where(input: Prisma.UserWhereInput): Relation<PersistedUser, UserMeta>;
    function build(input: Partial<UserCreateInput>): User;
    function includes<T extends readonly AssociationKey[]>(
      input: T
    ): Relation<Reset<PersistedUser, T>, UserMeta>;
  }
  interface User {
    /* columns */
    id: number | undefined;
    email: string;
    name: string | undefined;
    age: number | undefined;
    posts: CollectionProxy<Post, User>;

    isPersisted<T extends Model>(this: T): this is PersistedUser;
    update(input: Partial<UserCreateInput>): boolean;
  }
  type UserCreateInput = {
    id?: number;
    email: string;
    name?: string;
    age?: number;
    posts?: Post[];
  };
  type UserMeta = {
    WhereInput: {
      id?: number | Compare<number> | null;
      email?: string | Compare<string> | null;
      name?: string | Compare<string> | null;
      age?: number | Compare<number> | null;
    };
    OrderInput: {
      id?: SortOrder;
      email?: SortOrder;
      name?: SortOrder;
      age?: SortOrder;
    };
  }
  type Reset<S, T> = Omit<S, T[number]> & {
    [K in T[number]]: User[K];
  };
  type PersistedUser = User & {
    id: NonNullable<User["id"]>;
  };
  type AssociationKey = "posts";
}

declare module "./post" {
  namespace Post {
    function create(input: PostCreateInput): PersistedPost;
    function find(id: number): PersistedPost;
    function findBy(input: Prisma.PostWhereInput): PersistedPost | undefined;
    function all(): Relation<PersistedPost, PostMeta>;
    function order(column: keyof PostMeta["OrderInput"], direction?: "asc" | "desc"): Relation<PersistedPost, PostMeta>;
    function where(input: Prisma.PostWhereInput): Relation<PersistedPost, PostMeta>;
    function build(input: Partial<PostCreateInput>): Post;
    function includes<T extends readonly AssociationKey[]>(
      input: T
    ): Relation<Reset<PersistedPost, T>, PostMeta>;
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
      id?: number | Compare<number> | null;
      title?: string | Compare<string> | null;
      content?: string | Compare<string> | null;
      published?: boolean | Compare<boolean> | null;
      authorId?: number | Compare<number> | null;
    };
    OrderInput: {
      id?: SortOrder;
      title?: SortOrder;
      content?: SortOrder;
      published?: SortOrder;
      authorId?: SortOrder;
    };
  }
  type Reset<S, T> = Omit<S, T[number]> & {
    [K in T[number]]: Post[K];
  };
  type PersistedPost = Post & {
    id: NonNullable<Post["id"]>;
  };
  type AssociationKey = "posts";
}
