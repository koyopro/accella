import { User } from './user.js'
export { User } from './user.js'
import { Team } from './team.js'
export { Team } from './team.js'
import { UserTeam } from './userTeam.js'
export { UserTeam } from './userTeam.js'
import { Post } from './post.js'
export { Post } from './post.js'
import { PostTag } from './postTag.js'
export { PostTag } from './postTag.js'
import { Setting } from './setting.js'
export { Setting } from './setting.js'
import { Profile } from './profile.js'
export { Profile } from './profile.js'
import type {
  CollectionProxy,
  Filter,
  Relation,
  SortOrder,
  StringFilter,
} from "accel-record";

declare module "accel-record" {
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
    isPersisted<T>(this: T): this is Persisted<T>;
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;
    save<T>(this: T): this is Persisted<T>;
  }
}

type Persisted<T> = Meta<T>["Persisted"];

type Meta<T> = T extends typeof User | User ? UserMeta :
               T extends typeof Team | Team ? TeamMeta :
               T extends typeof UserTeam | UserTeam ? UserTeamMeta :
               T extends typeof Post | Post ? PostMeta :
               T extends typeof PostTag | PostTag ? PostTagMeta :
               T extends typeof Setting | Setting ? SettingMeta :
               T extends typeof Profile | Profile ? ProfileMeta :
               any;

export namespace $Enums {
  export const Role = {
    MEMBER: "MEMBER",
    ADMIN: "ADMIN",
  } as const;
  export type Role = (typeof Role)[keyof typeof Role];
}

export type Role = $Enums.Role;
export const Role = $Enums.Role;

declare module "./user" {
  interface User {
    id: number | undefined;
    email: string;
    name: string | undefined;
    age: number | undefined;
    posts: CollectionProxy<Post, UserMeta>;
    setting: Setting | undefined;
    teams: CollectionProxy<UserTeam, UserMeta>;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    Profile: Profile | undefined;
  }
}
export interface Persisted$User extends User {
  id: NonNullable<User["id"]>;
  setting: Persisted$Setting | undefined;
  createdAt: NonNullable<User["createdAt"]>;
  updatedAt: NonNullable<User["updatedAt"]>;
  Profile: Persisted$Profile | undefined;
};
type UserMeta = {
  Persisted: Persisted$User;
  AssociationKey: 'posts' | 'setting' | 'teams' | 'Profile';
  CreateInput: {
    id?: number;
    email: string;
    name?: string;
    age?: number;
    posts?: Post[];
    setting?: Setting;
    teams?: UserTeam[];
    createdAt?: Date;
    updatedAt?: Date;
    Profile?: Profile;
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    email?: string | string[] | StringFilter | null;
    name?: string | string[] | StringFilter | null;
    age?: number | number[] | Filter<number> | null;
    createdAt?: Date | Date[] | Filter<number> | null;
    updatedAt?: Date | Date[] | Filter<number> | null;
  };
  OrderInput: {
    id?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    age?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };
};

declare module "./team" {
  interface Team {
    id: number | undefined;
    name: string;
    users: CollectionProxy<UserTeam, TeamMeta>;
  }
}
export interface Persisted$Team extends Team {
  id: NonNullable<Team["id"]>;
};
type TeamMeta = {
  Persisted: Persisted$Team;
  AssociationKey: 'users';
  CreateInput: {
    id?: number;
    name: string;
    users?: UserTeam[];
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
  };
  OrderInput: {
    id?: SortOrder;
    name?: SortOrder;
  };
};

declare module "./userTeam" {
  interface UserTeam {
    user: User;
    userId: number;
    team: Team;
    teamId: number;
    assignedAt: Date | undefined;
    assignedBy: string;
  }
}
export interface Persisted$UserTeam extends UserTeam {
  user: Persisted$User;
  team: Persisted$Team;
  assignedAt: NonNullable<UserTeam["assignedAt"]>;
};
type UserTeamMeta = {
  Persisted: Persisted$UserTeam;
  AssociationKey: 'user' | 'team';
  CreateInput: {
    assignedAt?: Date;
    assignedBy: string;
  } & ({ user: User } | { userId: number }) & ({ team: Team } | { teamId: number });
  WhereInput: {
    userId?: number | number[] | Filter<number> | null;
    teamId?: number | number[] | Filter<number> | null;
    assignedAt?: Date | Date[] | Filter<number> | null;
    assignedBy?: string | string[] | StringFilter | null;
  };
  OrderInput: {
    userId?: SortOrder;
    teamId?: SortOrder;
    assignedAt?: SortOrder;
    assignedBy?: SortOrder;
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
    tags: CollectionProxy<PostTag, PostMeta>;
  }
}
export interface Persisted$Post extends Post {
  id: NonNullable<Post["id"]>;
  author: Persisted$User;
};
type PostMeta = {
  Persisted: Persisted$Post;
  AssociationKey: 'author' | 'tags';
  CreateInput: {
    id?: number;
    title: string;
    content?: string;
    published?: boolean;
    tags?: PostTag[];
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

declare module "./postTag" {
  interface PostTag {
    id: number | undefined;
    name: string;
    posts: CollectionProxy<Post, PostTagMeta>;
  }
}
export interface Persisted$PostTag extends PostTag {
  id: NonNullable<PostTag["id"]>;
};
type PostTagMeta = {
  Persisted: Persisted$PostTag;
  AssociationKey: 'posts';
  CreateInput: {
    id?: number;
    name: string;
    posts?: Post[];
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
  };
  OrderInput: {
    id?: SortOrder;
    name?: SortOrder;
  };
};

declare module "./setting" {
  interface Setting {
    settingId: number | undefined;
    user: User;
    userId: number;
    threshold: number | undefined;
    createdAt: Date | undefined;
    data: Setting["data"]
  }
}
export interface Persisted$Setting extends Setting {
  settingId: NonNullable<Setting["settingId"]>;
  user: Persisted$User;
  createdAt: NonNullable<Setting["createdAt"]>;
};
type SettingMeta = {
  Persisted: Persisted$Setting;
  AssociationKey: 'user';
  CreateInput: {
    settingId?: number;
    threshold?: number;
    createdAt?: Date;
    data?: Setting["data"];
  } & ({ user: User } | { userId: number });
  WhereInput: {
    settingId?: number | number[] | Filter<number> | null;
    userId?: number | number[] | Filter<number> | null;
    threshold?: number | number[] | Filter<number> | null;
    createdAt?: Date | Date[] | Filter<number> | null;
  };
  OrderInput: {
    settingId?: SortOrder;
    userId?: SortOrder;
    threshold?: SortOrder;
    createdAt?: SortOrder;
    data?: SortOrder;
  };
};

declare module "./profile" {
  interface Profile {
    id: number | undefined;
    user: User;
    userId: number;
    bio: string | undefined;
    point: number;
    enabled: boolean;
    role: Role;
  }
}
export interface Persisted$Profile extends Profile {
  id: NonNullable<Profile["id"]>;
  user: Persisted$User;
};
type ProfileMeta = {
  Persisted: Persisted$Profile;
  AssociationKey: 'user';
  CreateInput: {
    id?: number;
    bio?: string;
    point?: number;
    enabled?: boolean;
    role?: Role;
  } & ({ user: User } | { userId: number });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    userId?: number | number[] | Filter<number> | null;
    bio?: string | string[] | StringFilter | null;
    point?: number | number[] | Filter<number> | null;
    enabled?: boolean | boolean[] | undefined | null;
    role?: Role | Role[] | undefined | null;
  };
  OrderInput: {
    id?: SortOrder;
    userId?: SortOrder;
    bio?: SortOrder;
    point?: SortOrder;
    enabled?: SortOrder;
    role?: SortOrder;
  };
};
