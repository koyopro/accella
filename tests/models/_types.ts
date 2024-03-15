import { UserModel } from './user.js'
import { TeamModel } from './team.js'
import { UserTeamModel } from './userTeam.js'
import { PostModel } from './post.js'
import { PostTagModel } from './postTag.js'
import { SettingModel } from './setting.js'
import { ProfileModel } from './profile.js'
import {
  registerModel,
  type Collection,
  type Filter,
  type Relation,
  type SortOrder,
  type StringFilter,
} from "accel-record";

type Class = abstract new (...args: any) => any;

declare module "accel-record" {
  namespace Model {
    function build<T extends Class>(this: T, input: Partial<Meta<T>["CreateInput"]>): New<T>;
    function create<T extends Class>(this: T, input: Meta<T>["CreateInput"]): InstanceType<T>;
    function first<T extends Class>(this: T): InstanceType<T>;
    function find<T extends Class>(this: T, id: number): InstanceType<T>;
    function findBy<T extends Class>(this: T, input: Meta<T>['WhereInput']): InstanceType<T> | undefined;
    function all<T extends Class>(this: T): Relation<InstanceType<T>, Meta<T>>;
    function order<T extends Class>(this: T, column: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<InstanceType<T>, Meta<T>>;
    function offset<T extends Class>(this: T, offset: number): Relation<InstanceType<T>, Meta<T>>;
    function limit<T extends Class>(this: T, limit: number): Relation<InstanceType<T>, Meta<T>>;
    function where<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;
    function whereNot<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;
    function whereRaw<T extends Class>(this: T, query: string, bindings?: any[]): Relation<InstanceType<T>, Meta<T>>;
    function includes<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;
  }
  interface Model {
    isPersisted<T>(this: T): this is Persisted<T>;
    asPersisted<T>(this: T): Persisted<T> | undefined;
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;
    save<T>(this: T): this is Persisted<T>;
  }
}

type Persisted<T> = Meta<T>["Persisted"];
type New<T> = Meta<T>["New"];

type Meta<T> = T extends typeof UserModel | UserModel ? UserMeta :
               T extends typeof TeamModel | TeamModel ? TeamMeta :
               T extends typeof UserTeamModel | UserTeamModel ? UserTeamMeta :
               T extends typeof PostModel | PostModel ? PostMeta :
               T extends typeof PostTagModel | PostTagModel ? PostTagMeta :
               T extends typeof SettingModel | SettingModel ? SettingMeta :
               T extends typeof ProfileModel | ProfileModel ? ProfileMeta :
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
  interface UserModel {
    id: number | undefined;
    email: string | undefined;
    name: string | undefined;
    age: number | undefined;
    posts: Collection<PostModel, PostMeta>;
    setting: SettingModel | undefined;
    teams: Collection<UserTeamModel, UserTeamMeta>;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    Profile: ProfileModel | undefined;
  }
}
export interface NewUser extends UserModel {};
export class User extends UserModel {};
export interface User extends UserModel {
  id: number;
  email: string;
  get setting(): Setting | undefined;
  set setting(value: SettingModel | undefined);
  createdAt: Date;
  updatedAt: Date;
  get Profile(): Profile | undefined;
  set Profile(value: ProfileModel | undefined);
};
type UserMeta = {
  New: NewUser;
  Persisted: User;
  AssociationKey: 'posts' | 'setting' | 'teams' | 'Profile';
  CreateInput: {
    id?: number;
    email: string;
    name?: string;
    age?: number;
    posts?: PostModel[];
    setting?: SettingModel;
    teams?: UserTeamModel[];
    createdAt?: Date;
    updatedAt?: Date;
    Profile?: ProfileModel;
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
registerModel(User);

declare module "./team" {
  interface TeamModel {
    id: number | undefined;
    name: string | undefined;
    users: Collection<UserTeamModel, UserTeamMeta>;
  }
}
export interface NewTeam extends TeamModel {};
export class Team extends TeamModel {};
export interface Team extends TeamModel {
  id: number;
  name: string;
};
type TeamMeta = {
  New: NewTeam;
  Persisted: Team;
  AssociationKey: 'users';
  CreateInput: {
    id?: number;
    name: string;
    users?: UserTeamModel[];
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
registerModel(Team);

declare module "./userTeam" {
  interface UserTeamModel {
    user: User | undefined;
    userId: number | undefined;
    team: Team | undefined;
    teamId: number | undefined;
    assignedAt: Date | undefined;
    assignedBy: string | undefined;
  }
}
export interface NewUserTeam extends UserTeamModel {};
export class UserTeam extends UserTeamModel {};
export interface UserTeam extends UserTeamModel {
  user: User;
  userId: number;
  team: Team;
  teamId: number;
  assignedAt: Date;
  assignedBy: string;
};
type UserTeamMeta = {
  New: NewUserTeam;
  Persisted: UserTeam;
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
registerModel(UserTeam);

declare module "./post" {
  interface PostModel {
    id: number | undefined;
    title: string | undefined;
    content: string | undefined;
    published: boolean;
    author: User | undefined;
    authorId: number | undefined;
    tags: Collection<PostTagModel, PostTagMeta>;
  }
}
export interface NewPost extends PostModel {};
export class Post extends PostModel {};
export interface Post extends PostModel {
  id: number;
  title: string;
  author: User;
  authorId: number;
};
type PostMeta = {
  New: NewPost;
  Persisted: Post;
  AssociationKey: 'author' | 'tags';
  CreateInput: {
    id?: number;
    title: string;
    content?: string;
    published?: boolean;
    tags?: PostTagModel[];
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
registerModel(Post);

declare module "./postTag" {
  interface PostTagModel {
    id: number | undefined;
    name: string | undefined;
    posts: Collection<PostModel, PostMeta>;
  }
}
export interface NewPostTag extends PostTagModel {};
export class PostTag extends PostTagModel {};
export interface PostTag extends PostTagModel {
  id: number;
  name: string;
};
type PostTagMeta = {
  New: NewPostTag;
  Persisted: PostTag;
  AssociationKey: 'posts';
  CreateInput: {
    id?: number;
    name: string;
    posts?: PostModel[];
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
registerModel(PostTag);

declare module "./setting" {
  interface SettingModel {
    settingId: number | undefined;
    user: User | undefined;
    userId: number | undefined;
    threshold: number | undefined;
    createdAt: Date | undefined;
    data: SettingModel["data"]
  }
}
export interface NewSetting extends SettingModel {};
export class Setting extends SettingModel {};
export interface Setting extends SettingModel {
  settingId: number;
  user: User;
  userId: number;
  createdAt: Date;
};
type SettingMeta = {
  New: NewSetting;
  Persisted: Setting;
  AssociationKey: 'user';
  CreateInput: {
    settingId?: number;
    threshold?: number;
    createdAt?: Date;
    data?: SettingModel["data"];
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
registerModel(Setting);

declare module "./profile" {
  interface ProfileModel {
    id: number | undefined;
    user: User | undefined;
    userId: number | undefined;
    bio: string;
    point: number;
    enabled: boolean;
    role: Role;
  }
}
export interface NewProfile extends ProfileModel {};
export class Profile extends ProfileModel {};
export interface Profile extends ProfileModel {
  id: number;
  user: User;
  userId: number;
};
type ProfileMeta = {
  New: NewProfile;
  Persisted: Profile;
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
registerModel(Profile);
