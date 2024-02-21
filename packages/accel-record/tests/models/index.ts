import { User } from './user.js'
export { User } from './user.js'
import { Post } from './post.js'
export { Post } from './post.js'
import { Model, Relation } from "accel-record-core";
import type { CollectionProxy } from "accel-record-core";
import { Prisma } from "@prisma/client";

declare module "./user" {
  namespace User {
    function create(input: UserCreateInput): PersistedUser;
    function find(id: number): NoRelationUser;
    function findBy(input: Prisma.UserWhereInput): NoRelationUser | undefined;
    function all(): Relation<NoRelationUser>;
    function where(input: Prisma.UserWhereInput): Relation<NoRelationUser>;
    function build(input: Partial<UserCreateInput>): User;
    function includes<T extends readonly AssociationKey[]>(
      input: T
    ): Relation<Reset<NoRelationUser, T>>;
  }
  interface User {
    /* columns */
    id: number | undefined;
    email: string;
    name: string | undefined;
    posts: CollectionProxy<Post, User>;

    isPersisted<T extends Model>(this: T): this is PersistedUser;
    update(input: Partial<UserCreateInput>): boolean;
  }
  type UserCreateInput = {
    id?: number;
    email: string;
    name?: string;
    posts?: Post[];
  };
  type Reset<S, T> = Omit<S, T[number]> & {
    [K in T[number]]: User[K];
  };
  type PersistedUser = User & {
    id: NonNullable<User["id"]>;
  };
  type AssociationKey = "posts";
  type NoRelationUser = Omit<PersistedUser, AssociationKey> & {
    [K in AssociationKey]: unknown;
  };
}

declare module "./post" {
  namespace Post {
    function create(input: PostCreateInput): PersistedPost;
    function find(id: number): NoRelationPost;
    function findBy(input: Prisma.PostWhereInput): NoRelationPost | undefined;
    function all(): Relation<NoRelationPost>;
    function where(input: Prisma.PostWhereInput): Relation<NoRelationPost>;
    function build(input: Partial<PostCreateInput>): Post;
    function includes<T extends readonly AssociationKey[]>(
      input: T
    ): Relation<Reset<NoRelationPost, T>>;
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
  type Reset<S, T> = Omit<S, T[number]> & {
    [K in T[number]]: Post[K];
  };
  type PersistedPost = Post & {
    id: NonNullable<Post["id"]>;
  };
  type AssociationKey = "posts";
  type NoRelationPost = Omit<PersistedPost, AssociationKey> & {
    [K in AssociationKey]: unknown;
  };
}
