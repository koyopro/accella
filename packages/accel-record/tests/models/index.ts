import { User } from './user.js'
export { User } from './user.js'
import { Post } from './post.js'
export { Post } from './post.js'
import { Setting } from './setting.js'
export { Setting } from './setting.js'
import type {
  CollectionProxy,
  Filter,
  Relation,
  SortOrder,
  StringFilter,
} from "accel-record-core";

declare module "accel-record-core" {
  namespace Model {
    function create<T>(this: T, input: Meta<T>["CreateInput"]): Persisted<T>;
    function first<T>(this: T): Persisted<T>;
    function find<T>(this: T, id: number): Persisted<T>;
    function findBy<T>(this: T, input: Meta<T>['WhereInput']): Persisted<T> | undefined;
    function all<T>(this: T): Relation<Persisted<T>, Meta<T>>;
    function order<T>(this: T, column: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<Persisted<T>, Meta<T>>;
    function offset<T>(this: T, offset: number): Relation<Persisted<T>, Meta<T>>;
    function limit<T>(this: T, limit: number): Relation<Persisted<T>, Meta<T>>;
    function where<T>(this: T, input: Meta<T>['WhereInput']): Relation<Persisted<T>, Meta<T>>;
    function whereNot<T>(this: T, input: Meta<T>['WhereInput']): Relation<Persisted<T>, Meta<T>>;
    function whereRaw<T>(this: T, query: string, bindings?: any[]): Relation<Persisted<T>, Meta<T>>;
    function build<T extends abstract new (...args: any) => any>(this: T, input: Partial<Meta<T>["CreateInput"]>): InstanceType<T>;
    function includes<T>(this: T, input: Meta<T>['AssociationKey'][]): Relation<Persisted<T>, Meta<T>>;
  }
  interface Model {
    isPersisted<T>(this: T): this is IPersisted<T>;
    update<T>(this: T, input: Partial<IMeta<T>['CreateInput']>): boolean;
  }
}

type Persisted<T> = Meta<T>["Persisted"];
type IPersisted<T> = IMeta<T>["Persisted"];

type Meta<T> = T extends typeof User ? UserMeta :
               T extends typeof Post ? PostMeta :
               T extends typeof Setting ? SettingMeta :
               any;
type IMeta<T> = T extends User ? UserMeta :
                T extends Post ? PostMeta :
                T extends Setting ? SettingMeta :
                any;

declare module "./user" {
  interface User {
    id: number | undefined;
    email: string;
    name: string | undefined;
    age: number | undefined;
    posts: CollectionProxy<Post, UserMeta>;
    setting: Setting | undefined;
  }
}
type PersistedUser = User & {
  id: NonNullable<User["id"]>;
};
type UserMeta = {
  Persisted: PersistedUser;
  AssociationKey: 'posts';
  CreateInput: {
    id?: number;
    email: string;
    name?: string;
    age?: number;
    posts?: Post[];
    setting?: Setting;
  };
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
};

declare module "./post" {
  interface Post {
    id: number | undefined;
    title: string;
    content: string | undefined;
    published: boolean;
    author: User;
    authorId: number;
  }
}
type PersistedPost = Post & {
  id: NonNullable<Post["id"]>;
};
type PostMeta = {
  Persisted: PersistedPost;
  AssociationKey: 'posts';
  CreateInput: {
    id?: number;
    title: string;
    content?: string;
    published?: boolean;
  } & ({ author: User } | { authorId: number });
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
};

declare module "./setting" {
  interface Setting {
    id: number | undefined;
    user: User;
    userId: number;
    threshold: number | undefined;
    createdAt: Date;
  }
}
type PersistedSetting = Setting & {
  id: NonNullable<Setting["id"]>;
};
type SettingMeta = {
  Persisted: PersistedSetting;
  AssociationKey: 'posts';
  CreateInput: {
    id?: number;
    threshold?: number;
    createdAt?: Date;
  } & ({ user: User } | { userId: number });
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
};
