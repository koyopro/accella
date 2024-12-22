/* eslint-disable */
/***************************************************************
* This file is automatically generated. Please do not modify.
***************************************************************/

import { type DataSource } from "@prisma/generator-helper";

import { UserModel } from './user.js'
import { TeamModel } from './team.js'
import { UserTeamModel } from './userTeam.js'
import { PostModel } from './post.js'
import { PostTagModel } from './postTag.js'
import { SettingModel } from './setting.js'
import { ProfileModel } from './profile.js'
import { CompanyModel } from './company.js'
import { EmployeeModel } from './employee.js'
import { ValidateSampleModel } from './validateSample.js'
import { AccountModel } from './account.js'
import { AuthorModel } from './author.js'
import { BookModel } from './book.js'
import {
  generateDatabaseConfig,
  registerModel,
  type Collection,
  type Filter,
  type StringFilter,
} from "accel-record";
import {
  Attribute,
  defineEnumTextAttribute,
} from "accel-record/enums";

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;

  interface Relation<T, M> {
    john: (T extends User ? typeof UserModel['john'] : T extends Post ? typeof PostModel['john'] : never);
    adults: (T extends User ? typeof UserModel['adults'] : never);
  }
}

type Meta<T> = T extends typeof UserModel | UserModel ? UserMeta :
               T extends typeof TeamModel | TeamModel ? TeamMeta :
               T extends typeof UserTeamModel | UserTeamModel ? UserTeamMeta :
               T extends typeof PostModel | PostModel ? PostMeta :
               T extends typeof PostTagModel | PostTagModel ? PostTagMeta :
               T extends typeof SettingModel | SettingModel ? SettingMeta :
               T extends typeof ProfileModel | ProfileModel ? ProfileMeta :
               T extends typeof CompanyModel | CompanyModel ? CompanyMeta :
               T extends typeof EmployeeModel | EmployeeModel ? EmployeeMeta :
               T extends typeof ValidateSampleModel | ValidateSampleModel ? ValidateSampleMeta :
               T extends typeof AccountModel | AccountModel ? AccountMeta :
               T extends typeof AuthorModel | AuthorModel ? AuthorMeta :
               T extends typeof BookModel | BookModel ? BookMeta :
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
    passwordDigest: string | undefined;
    name: string | undefined;
    age: number | undefined;
    get posts(): PostCollection<PostModel>;
    set posts(value: PostModel[]);
    setting: SettingModel | undefined;
    get teams(): UserTeamCollection<UserTeamModel>;
    set teams(value: UserTeamModel[]);
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    Profile: ProfileModel | undefined;
  }
}
export interface NewUser extends UserModel {};
export class User extends UserModel {
};
export interface User extends UserModel {
  id: number;
  email: string;
  get posts(): PostCollection<Post>;
  set posts(value: PostModel[]);
  get setting(): Setting | undefined;
  set setting(value: SettingModel | undefined);
  get teams(): UserTeamCollection<UserTeam>;
  set teams(value: UserTeamModel[]);
  createdAt: Date;
  updatedAt: Date;
  get Profile(): Profile | undefined;
  set Profile(value: ProfileModel | undefined);
};
type UserAssociationKey = 'posts' | 'setting' | 'teams' | 'Profile';
type UserCollection<T extends UserModel> = Collection<T, UserMeta> | Collection<User, UserMeta>;
type UserMeta = {
  Base: UserModel;
  New: NewUser;
  Persisted: User;
  PrimaryKey: number;
  AssociationKey: UserAssociationKey;
  JoinInput: UserAssociationKey | UserAssociationKey[] | {
    posts?: Meta<Post>['JoinInput'];
    setting?: Meta<Setting>['JoinInput'];
    teams?: Meta<UserTeam>['JoinInput'];
    Profile?: Meta<Profile>['JoinInput'];
  };
  Column: {
    id: number;
    email: string;
    passwordDigest: string | undefined;
    name: string | undefined;
    age: number | undefined;
    createdAt: Date;
    updatedAt: Date;
  };
  CreateInput: {
    id?: number;
    email: string;
    passwordDigest?: string;
    password?: string;
    passwordConfirmation?: string;
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
    passwordDigest?: string | string[] | StringFilter | null;
    name?: string | string[] | StringFilter | null;
    age?: number | number[] | Filter<number> | null;
    posts?: PostMeta['WhereInput'];
    setting?: SettingMeta['WhereInput'];
    teams?: UserTeamMeta['WhereInput'];
    createdAt?: Date | Date[] | Filter<Date> | null;
    updatedAt?: Date | Date[] | Filter<Date> | null;
    Profile?: ProfileMeta['WhereInput'];
  };
};
registerModel(User);

declare module "./team" {
  interface TeamModel {
    id: number | undefined;
    name: string | undefined;
    get users(): UserTeamCollection<UserTeamModel>;
    set users(value: UserTeamModel[]);
  }
}
export interface NewTeam extends TeamModel {};
export class Team extends TeamModel {
};
export interface Team extends TeamModel {
  id: number;
  name: string;
  get users(): UserTeamCollection<UserTeam>;
  set users(value: UserTeamModel[]);
};
type TeamAssociationKey = 'users';
type TeamCollection<T extends TeamModel> = Collection<T, TeamMeta> | Collection<Team, TeamMeta>;
type TeamMeta = {
  Base: TeamModel;
  New: NewTeam;
  Persisted: Team;
  PrimaryKey: number;
  AssociationKey: TeamAssociationKey;
  JoinInput: TeamAssociationKey | TeamAssociationKey[] | {
    users?: Meta<UserTeam>['JoinInput'];
  };
  Column: {
    id: number;
    name: string;
  };
  CreateInput: {
    id?: number;
    name: string;
    users?: UserTeamModel[];
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
    users?: UserTeamMeta['WhereInput'];
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
export class UserTeam extends UserTeamModel {
};
export interface UserTeam extends UserTeamModel {
  user: User;
  userId: number;
  team: Team;
  teamId: number;
  assignedAt: Date;
  assignedBy: string;
};
type UserTeamAssociationKey = 'user' | 'team';
type UserTeamCollection<T extends UserTeamModel> = Collection<T, UserTeamMeta> | Collection<UserTeam, UserTeamMeta>;
type UserTeamMeta = {
  Base: UserTeamModel;
  New: NewUserTeam;
  Persisted: UserTeam;
  PrimaryKey: [number, number];
  AssociationKey: UserTeamAssociationKey;
  JoinInput: UserTeamAssociationKey | UserTeamAssociationKey[] | {
    user?: Meta<User>['JoinInput'];
    team?: Meta<Team>['JoinInput'];
  };
  Column: {
    userId: number;
    teamId: number;
    assignedAt: Date;
    assignedBy: string;
  };
  CreateInput: {
    assignedAt?: Date;
    assignedBy: string;
  } & ({ user: User } | { userId: number }) & ({ team: Team } | { teamId: number });
  WhereInput: {
    user?: User | User[] | UserMeta['WhereInput'];
    userId?: number | number[] | Filter<number> | null;
    team?: Team | Team[] | TeamMeta['WhereInput'];
    teamId?: number | number[] | Filter<number> | null;
    assignedAt?: Date | Date[] | Filter<Date> | null;
    assignedBy?: string | string[] | StringFilter | null;
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
    get tags(): PostTagCollection<PostTagModel>;
    set tags(value: PostTagModel[]);
  }
}
export interface NewPost extends PostModel {};
export class Post extends PostModel {
};
export interface Post extends PostModel {
  id: number;
  title: string;
  author: User;
  authorId: number;
  get tags(): PostTagCollection<PostTag>;
  set tags(value: PostTagModel[]);
};
type PostAssociationKey = 'author' | 'tags';
type PostCollection<T extends PostModel> = Collection<T, PostMeta> | Collection<Post, PostMeta>;
type PostMeta = {
  Base: PostModel;
  New: NewPost;
  Persisted: Post;
  PrimaryKey: number;
  AssociationKey: PostAssociationKey;
  JoinInput: PostAssociationKey | PostAssociationKey[] | {
    author?: Meta<User>['JoinInput'];
    tags?: Meta<PostTag>['JoinInput'];
  };
  Column: {
    id: number;
    title: string;
    content: string | undefined;
    published: boolean;
    authorId: number;
  };
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
    author?: User | User[] | UserMeta['WhereInput'];
    authorId?: number | number[] | Filter<number> | null;
    tags?: PostTagMeta['WhereInput'];
  };
};
registerModel(Post);

declare module "./postTag" {
  interface PostTagModel {
    id: number | undefined;
    name: string | undefined;
    get posts(): PostCollection<PostModel>;
    set posts(value: PostModel[]);
  }
}
export interface NewPostTag extends PostTagModel {};
export class PostTag extends PostTagModel {
};
export interface PostTag extends PostTagModel {
  id: number;
  name: string;
  get posts(): PostCollection<Post>;
  set posts(value: PostModel[]);
};
type PostTagAssociationKey = 'posts';
type PostTagCollection<T extends PostTagModel> = Collection<T, PostTagMeta> | Collection<PostTag, PostTagMeta>;
type PostTagMeta = {
  Base: PostTagModel;
  New: NewPostTag;
  Persisted: PostTag;
  PrimaryKey: number;
  AssociationKey: PostTagAssociationKey;
  JoinInput: PostTagAssociationKey | PostTagAssociationKey[] | {
    posts?: Meta<Post>['JoinInput'];
  };
  Column: {
    id: number;
    name: string;
  };
  CreateInput: {
    id?: number;
    name: string;
    posts?: PostModel[];
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
    posts?: PostMeta['WhereInput'];
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
export class Setting extends SettingModel {
};
export interface Setting extends SettingModel {
  settingId: number;
  user: User;
  userId: number;
  createdAt: Date;
};
type SettingAssociationKey = 'user';
type SettingCollection<T extends SettingModel> = Collection<T, SettingMeta> | Collection<Setting, SettingMeta>;
type SettingMeta = {
  Base: SettingModel;
  New: NewSetting;
  Persisted: Setting;
  PrimaryKey: number;
  AssociationKey: SettingAssociationKey;
  JoinInput: SettingAssociationKey | SettingAssociationKey[] | {
    user?: Meta<User>['JoinInput'];
  };
  Column: {
    settingId: number;
    userId: number;
    threshold: number | undefined;
    createdAt: Date;
  };
  CreateInput: {
    settingId?: number;
    threshold?: number;
    createdAt?: Date;
    data?: SettingModel["data"];
  } & ({ user: User } | { userId: number });
  WhereInput: {
    settingId?: number | number[] | Filter<number> | null;
    user?: User | User[] | UserMeta['WhereInput'];
    userId?: number | number[] | Filter<number> | null;
    threshold?: number | number[] | Filter<number> | null;
    createdAt?: Date | Date[] | Filter<Date> | null;
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
    roleText: string;
    uuid: string;
    uuid7: string;
    cuid: string;
    avatarPath: string | undefined;
  }
}
export interface NewProfile extends ProfileModel {};
export class Profile extends ProfileModel {
  static role = new Attribute(this, "Role", Role);
};
export interface Profile extends ProfileModel {
  id: number;
  user: User;
  userId: number;
};
type ProfileAssociationKey = 'user';
type ProfileCollection<T extends ProfileModel> = Collection<T, ProfileMeta> | Collection<Profile, ProfileMeta>;
type ProfileMeta = {
  Base: ProfileModel;
  New: NewProfile;
  Persisted: Profile;
  PrimaryKey: number;
  AssociationKey: ProfileAssociationKey;
  JoinInput: ProfileAssociationKey | ProfileAssociationKey[] | {
    user?: Meta<User>['JoinInput'];
  };
  Column: {
    id: number;
    userId: number;
    bio: string | undefined;
    point: number;
    enabled: boolean;
    role: Role;
    uuid: string;
    uuid7: string;
    cuid: string;
    avatarPath: string | undefined;
  };
  CreateInput: {
    id?: number;
    bio?: string;
    point?: number;
    enabled?: boolean;
    role?: Role;
    uuid?: string;
    uuid7?: string;
    cuid?: string;
    avatarPath?: string;
  } & ({ user: User } | { userId: number });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    user?: User | User[] | UserMeta['WhereInput'];
    userId?: number | number[] | Filter<number> | null;
    bio?: string | string[] | StringFilter | null;
    point?: number | number[] | Filter<number> | null;
    enabled?: boolean | boolean[] | undefined | null;
    role?: Role | Role[] | undefined | null;
    uuid?: string | string[] | StringFilter | null;
    uuid7?: string | string[] | StringFilter | null;
    cuid?: string | string[] | StringFilter | null;
    avatarPath?: string | string[] | StringFilter | null;
  };
};
registerModel(Profile);
defineEnumTextAttribute(ProfileModel, Profile, "role");

declare module "./company" {
  interface CompanyModel {
    id: number | undefined;
    name: string | undefined;
    get employees(): EmployeeCollection<EmployeeModel>;
    set employees(value: EmployeeModel[]);
  }
}
export interface NewCompany extends CompanyModel {};
export class Company extends CompanyModel {
};
export interface Company extends CompanyModel {
  id: number;
  name: string;
  get employees(): EmployeeCollection<Employee>;
  set employees(value: EmployeeModel[]);
};
type CompanyAssociationKey = 'employees';
type CompanyCollection<T extends CompanyModel> = Collection<T, CompanyMeta> | Collection<Company, CompanyMeta>;
type CompanyMeta = {
  Base: CompanyModel;
  New: NewCompany;
  Persisted: Company;
  PrimaryKey: number;
  AssociationKey: CompanyAssociationKey;
  JoinInput: CompanyAssociationKey | CompanyAssociationKey[] | {
    employees?: Meta<Employee>['JoinInput'];
  };
  Column: {
    id: number;
    name: string;
  };
  CreateInput: {
    id?: number;
    name: string;
    employees?: EmployeeModel[];
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
    employees?: EmployeeMeta['WhereInput'];
  };
};
registerModel(Company);

declare module "./employee" {
  interface EmployeeModel {
    id: number | undefined;
    name: string | undefined;
    companyId: number | undefined;
    company: Company | undefined;
  }
}
export interface NewEmployee extends EmployeeModel {};
export class Employee extends EmployeeModel {
};
export interface Employee extends EmployeeModel {
  id: number;
  name: string;
  companyId: number;
  company: Company;
};
type EmployeeAssociationKey = 'company';
type EmployeeCollection<T extends EmployeeModel> = Collection<T, EmployeeMeta> | Collection<Employee, EmployeeMeta>;
type EmployeeMeta = {
  Base: EmployeeModel;
  New: NewEmployee;
  Persisted: Employee;
  PrimaryKey: number;
  AssociationKey: EmployeeAssociationKey;
  JoinInput: EmployeeAssociationKey | EmployeeAssociationKey[] | {
    company?: Meta<Company>['JoinInput'];
  };
  Column: {
    id: number;
    name: string;
    companyId: number;
  };
  CreateInput: {
    id?: number;
    name: string;
  } & ({ company: Company } | { companyId: number });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
    companyId?: number | number[] | Filter<number> | null;
    company?: Company | Company[] | CompanyMeta['WhereInput'];
  };
};
registerModel(Employee);

declare module "./validateSample" {
  interface ValidateSampleModel {
    id: number | undefined;
    accepted: boolean | undefined;
    pattern: string | undefined;
    key: string | undefined;
    count: number | undefined;
    size: string | undefined;
  }
}
export interface NewValidateSample extends ValidateSampleModel {};
export class ValidateSample extends ValidateSampleModel {
};
export interface ValidateSample extends ValidateSampleModel {
  id: number;
  accepted: boolean;
  pattern: string;
  key: string;
  count: number;
  size: string;
};
type ValidateSampleAssociationKey = never;
type ValidateSampleCollection<T extends ValidateSampleModel> = Collection<T, ValidateSampleMeta> | Collection<ValidateSample, ValidateSampleMeta>;
type ValidateSampleMeta = {
  Base: ValidateSampleModel;
  New: NewValidateSample;
  Persisted: ValidateSample;
  PrimaryKey: number;
  AssociationKey: ValidateSampleAssociationKey;
  JoinInput: ValidateSampleAssociationKey | ValidateSampleAssociationKey[];
  Column: {
    id: number;
    accepted: boolean;
    pattern: string;
    key: string;
    count: number;
    size: string;
  };
  CreateInput: {
    id?: number;
    accepted: boolean;
    pattern: string;
    key: string;
    count: number;
    size: string;
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    accepted?: boolean | boolean[] | undefined | null;
    pattern?: string | string[] | StringFilter | null;
    key?: string | string[] | StringFilter | null;
    count?: number | number[] | Filter<number> | null;
    size?: string | string[] | StringFilter | null;
  };
};
registerModel(ValidateSample);

declare module "./account" {
  interface AccountModel {
    id: number | undefined;
    email: string | undefined;
    passwordDigest: string | undefined;
  }
}
export interface NewAccount extends AccountModel {};
export class Account extends AccountModel {
};
export interface Account extends AccountModel {
  id: number;
  email: string;
  passwordDigest: string;
};
type AccountAssociationKey = never;
type AccountCollection<T extends AccountModel> = Collection<T, AccountMeta> | Collection<Account, AccountMeta>;
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
  };
  CreateInput: {
    id?: number;
    email: string;
    passwordDigest?: string;
    password?: string;
    passwordConfirmation?: string;
  };
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    email?: string | string[] | StringFilter | null;
    passwordDigest?: string | string[] | StringFilter | null;
  };
};
registerModel(Account);

declare module "./author" {
  interface AuthorModel {
    firstName: string | undefined;
    lastName: string | undefined;
    get books(): BookCollection<BookModel>;
    set books(value: BookModel[]);
  }
}
export interface NewAuthor extends AuthorModel {};
export class Author extends AuthorModel {
};
export interface Author extends AuthorModel {
  firstName: string;
  lastName: string;
  get books(): BookCollection<Book>;
  set books(value: BookModel[]);
};
type AuthorAssociationKey = 'books';
type AuthorCollection<T extends AuthorModel> = Collection<T, AuthorMeta> | Collection<Author, AuthorMeta>;
type AuthorMeta = {
  Base: AuthorModel;
  New: NewAuthor;
  Persisted: Author;
  PrimaryKey: [string, string];
  AssociationKey: AuthorAssociationKey;
  JoinInput: AuthorAssociationKey | AuthorAssociationKey[] | {
    books?: Meta<Book>['JoinInput'];
  };
  Column: {
    firstName: string;
    lastName: string;
  };
  CreateInput: {
    firstName: string;
    lastName: string;
    books?: BookModel[];
  };
  WhereInput: {
    firstName?: string | string[] | StringFilter | null;
    lastName?: string | string[] | StringFilter | null;
    books?: BookMeta['WhereInput'];
  };
};
registerModel(Author);

declare module "./book" {
  interface BookModel {
    id: number | undefined;
    title: string | undefined;
    author: Author | undefined;
    authorFirstName: string | undefined;
    authorLastName: string | undefined;
  }
}
export interface NewBook extends BookModel {};
export class Book extends BookModel {
};
export interface Book extends BookModel {
  id: number;
  title: string;
  author: Author;
  authorFirstName: string;
  authorLastName: string;
};
type BookAssociationKey = 'author';
type BookCollection<T extends BookModel> = Collection<T, BookMeta> | Collection<Book, BookMeta>;
type BookMeta = {
  Base: BookModel;
  New: NewBook;
  Persisted: Book;
  PrimaryKey: number;
  AssociationKey: BookAssociationKey;
  JoinInput: BookAssociationKey | BookAssociationKey[] | {
    author?: Meta<Author>['JoinInput'];
  };
  Column: {
    id: number;
    title: string;
    authorFirstName: string;
    authorLastName: string;
  };
  CreateInput: {
    id?: number;
    title: string;
  } & ({ author: Author } | { authorFirstName: string, authorLastName: string });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    title?: string | string[] | StringFilter | null;
    author?: Author | Author[] | AuthorMeta['WhereInput'];
    authorFirstName?: string | string[] | StringFilter | null;
    authorLastName?: string | string[] | StringFilter | null;
  };
};
registerModel(Book);


export const schemaDir = "../../prisma_mysql";
export const dataSource = {
  "name": "db",
  "provider": "mysql",
  "activeProvider": "mysql",
  "url": {
    "fromEnvVar": null,
    "value": "mysql://root:@localhost:3306/accel_test1"
  },
  "schemas": []
} as DataSource;

/**
 * Retrieves the database connection settings based on the Prisma schema file.
 */
export const getDatabaseConfig = () => generateDatabaseConfig(dataSource, import.meta.url, schemaDir);
