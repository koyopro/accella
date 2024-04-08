import { UserModel } from './user.js'
import { TeamModel } from './team.js'
import { UserTeamModel } from './userTeam.js'
import { PostModel } from './post.js'
import { PostTagModel } from './postTag.js'
import { SettingModel } from './setting.js'
import { ProfileModel } from './profile.js'
import { CompanyModel } from './company.js'
import { EmployeeModel } from './employee.js'
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
  function meta<T>(model: T): Meta<T>;

  /**
   * @namespace Model
   * @description This namespace contains various functions related to model operations.
   */
  namespace Model {
    /**
     * @function build
     * @description Creates a new instance of a model with the provided input.
     * @param {T} this - The model class.
     * @param {Partial<Meta<T>["CreateInput"]>} input - The input data for creating the model instance.
     * @returns {New<T>} - The newly created model instance.
     */
    function build<T extends Class>(this: T, input: Partial<Meta<T>["CreateInput"]>): New<T>;

    /**
     * @function select
     * @description Selects specific attributes from the model instances.
     * @param {T} this - The model class.
     * @param {...(keyof Meta<T>["OrderInput"])[]} attributes - The attributes to select.
     * @returns {Relation<{ [K in F[number]]: InstanceType<T>[K] }, Meta<T>>} - The relation containing the selected attributes.
     */
    function select<T extends Class, F extends (keyof Meta<T>["OrderInput"])[]>(this: T, ...attributes: F): Relation<{ [K in F[number]]: InstanceType<T>[K] }, Meta<T>>;

    /**
     * @function findBy
     * @description Finds a model instance based on the provided input.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for finding the model instance.
     * @returns {InstanceType<T> | undefined} - The found model instance, or undefined if not found.
     */
    function findBy<T extends Class>(this: T, input: Meta<T>['WhereInput']): InstanceType<T> | undefined;

    /**
     * @function all
     * @description Retrieves all model instances.
     * @param {T} this - The model class.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing all model instances.
     */
    function all<T extends Class>(this: T): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function order
     * @description Orders the model instances based on the specified attribute and direction.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to order by.
     * @param {"asc" | "desc"} [direction] - The direction of ordering. Default is "asc".
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the ordered model instances.
     */
    function order<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function offset
     * @description Sets the offset for retrieving model instances.
     * @param {T} this - The model class.
     * @param {number} offset - The offset value.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the specified offset.
     */
    function offset<T extends Class>(this: T, offset: number): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function limit
     * @description Sets the limit for retrieving model instances.
     * @param {T} this - The model class.
     * @param {number} limit - The limit value.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the specified limit.
     */
    function limit<T extends Class>(this: T, limit: number): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided input.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided query and bindings.
     * @param {T} this - The model class.
     * @param {string} query - The query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided query or input and bindings.
     * @param {T} this - The model class.
     * @param {string | Meta<T>['WhereInput']} queryOrInput - The query string or input data for filtering the model instances.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, queryOrInput: string | Meta<T>['WhereInput'], ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function whereNot
     * @description Filters the model instances based on the provided input, excluding the matching instances.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function whereNot<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function whereRaw
     * @description Filters the model instances based on the provided raw query and bindings.
     * @param {T} this - The model class.
     * @param {string} query - The raw query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function whereRaw<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function includes
     * @description Eager loads the specified associations for the model instances.
     * @param {T} this - The model class.
     * @param {...Meta<T>['AssociationKey'][]} input - The associations to include.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the included associations.
     */
    function includes<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function joins
     * @description Performs inner joins with the specified associations for the model instances.
     * @param {T} this - The model class.
     * @param {...Meta<T>['AssociationKey'][]} input - The associations to join.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the joined associations.
     */
    function joins<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function joinsRaw
     * @description Performs joins with the specified raw query and bindings for the model instances.
     * @param {T} this - The model class.
     * @param {string} query - The raw query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the joined associations.
     */
    function joinsRaw<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function maximum
     * @description Retrieves the maximum value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the maximum value from.
     * @returns {number} - The maximum value of the attribute.
     */
    function maximum<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;

    /**
     * @function minimum
     * @description Retrieves the minimum value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the minimum value from.
     * @returns {number} - The minimum value of the attribute.
     */
    function minimum<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;

    /**
     * @function average
     * @description Retrieves the average value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the average value from.
     * @returns {number} - The average value of the attribute.
     */
    function average<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;
  }

  interface Model {
    /**
     * @function isPersisted
     * @description Checks if the model instance is persisted in the database.
     * @returns {boolean} - True if the model instance is persisted, false otherwise.
     */
    isPersisted<T>(this: T): this is Persisted<T>;

    /**
     * @function asPersisted
     * @description Converts the model instance to a persisted instance.
     * @returns {Persisted<T> | undefined} - The persisted instance, or undefined if not persisted.
     */
    asPersisted<T>(this: T): Persisted<T> | undefined;

    /**
     * @function update
     * @description Updates the model instance with the provided input.
     * @param {Partial<Meta<T>["CreateInput"]>} input - The input data for updating the model instance.
     * @returns {boolean} - True if the model instance is updated, false otherwise.
     */
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;

    /**
     * @function save
     * @description Saves the model instance to the database.
     * @returns {boolean} - True if the model instance is saved, false otherwise.
     */
    save<T>(this: T): this is Persisted<T>;

    /**
     * @function isChanged
     * @description Checks if the model instance has changed.
     * @param {keyof Meta<T>["OrderInput"]} [attr] - The attribute to check for changes. If not provided, checks if any attribute has changed.
     * @returns {boolean} - True if the model instance has changed, false otherwise.
     */
    isChanged<T>(this: T, attr?: keyof Meta<T>["OrderInput"]): boolean;

    /**
     * @function isAttributeChanged
     * @description Checks if the specified attribute of the model instance has changed.
     * @param {keyof Meta<T>["OrderInput"]} attr - The attribute to check for changes.
     * @returns {boolean} - True if the attribute has changed, false otherwise.
     */
    isAttributeChanged<T>(this: T, attr: keyof Meta<T>["OrderInput"]): boolean;
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
               T extends typeof CompanyModel | CompanyModel ? CompanyMeta :
               T extends typeof EmployeeModel | EmployeeModel ? EmployeeMeta :
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
export class User extends UserModel {};
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
type UserCollection<T extends UserModel> = Collection<T, UserMeta> | Collection<User, UserMeta>;
type UserMeta = {
  Base: UserModel;
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
    createdAt?: Date | Date[] | Filter<Date> | null;
    updatedAt?: Date | Date[] | Filter<Date> | null;
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
    get users(): UserTeamCollection<UserTeamModel>;
    set users(value: UserTeamModel[]);
  }
}
export interface NewTeam extends TeamModel {};
export class Team extends TeamModel {};
export interface Team extends TeamModel {
  id: number;
  name: string;
  get users(): UserTeamCollection<UserTeam>;
  set users(value: UserTeamModel[]);
};
type TeamCollection<T extends TeamModel> = Collection<T, TeamMeta> | Collection<Team, TeamMeta>;
type TeamMeta = {
  Base: TeamModel;
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
type UserTeamCollection<T extends UserTeamModel> = Collection<T, UserTeamMeta> | Collection<UserTeam, UserTeamMeta>;
type UserTeamMeta = {
  Base: UserTeamModel;
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
    assignedAt?: Date | Date[] | Filter<Date> | null;
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
    get tags(): PostTagCollection<PostTagModel>;
    set tags(value: PostTagModel[]);
  }
}
export interface NewPost extends PostModel {};
export class Post extends PostModel {};
export interface Post extends PostModel {
  id: number;
  title: string;
  author: User;
  authorId: number;
  get tags(): PostTagCollection<PostTag>;
  set tags(value: PostTagModel[]);
};
type PostCollection<T extends PostModel> = Collection<T, PostMeta> | Collection<Post, PostMeta>;
type PostMeta = {
  Base: PostModel;
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
    get posts(): PostCollection<PostModel>;
    set posts(value: PostModel[]);
  }
}
export interface NewPostTag extends PostTagModel {};
export class PostTag extends PostTagModel {};
export interface PostTag extends PostTagModel {
  id: number;
  name: string;
  get posts(): PostCollection<Post>;
  set posts(value: PostModel[]);
};
type PostTagCollection<T extends PostTagModel> = Collection<T, PostTagMeta> | Collection<PostTag, PostTagMeta>;
type PostTagMeta = {
  Base: PostTagModel;
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
type SettingCollection<T extends SettingModel> = Collection<T, SettingMeta> | Collection<Setting, SettingMeta>;
type SettingMeta = {
  Base: SettingModel;
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
    createdAt?: Date | Date[] | Filter<Date> | null;
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
    uuid: string;
    cuid: string;
  }
}
export interface NewProfile extends ProfileModel {};
export class Profile extends ProfileModel {};
export interface Profile extends ProfileModel {
  id: number;
  user: User;
  userId: number;
};
type ProfileCollection<T extends ProfileModel> = Collection<T, ProfileMeta> | Collection<Profile, ProfileMeta>;
type ProfileMeta = {
  Base: ProfileModel;
  New: NewProfile;
  Persisted: Profile;
  AssociationKey: 'user';
  CreateInput: {
    id?: number;
    bio?: string;
    point?: number;
    enabled?: boolean;
    role?: Role;
    uuid?: string;
    cuid?: string;
  } & ({ user: User } | { userId: number });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    userId?: number | number[] | Filter<number> | null;
    bio?: string | string[] | StringFilter | null;
    point?: number | number[] | Filter<number> | null;
    enabled?: boolean | boolean[] | undefined | null;
    role?: Role | Role[] | undefined | null;
    uuid?: string | string[] | StringFilter | null;
    cuid?: string | string[] | StringFilter | null;
  };
  OrderInput: {
    id?: SortOrder;
    userId?: SortOrder;
    bio?: SortOrder;
    point?: SortOrder;
    enabled?: SortOrder;
    role?: SortOrder;
    uuid?: SortOrder;
    cuid?: SortOrder;
  };
};
registerModel(Profile);

declare module "./company" {
  interface CompanyModel {
    id: number | undefined;
    name: string | undefined;
    get employees(): EmployeeCollection<EmployeeModel>;
    set employees(value: EmployeeModel[]);
  }
}
export interface NewCompany extends CompanyModel {};
export class Company extends CompanyModel {};
export interface Company extends CompanyModel {
  id: number;
  name: string;
  get employees(): EmployeeCollection<Employee>;
  set employees(value: EmployeeModel[]);
};
type CompanyCollection<T extends CompanyModel> = Collection<T, CompanyMeta> | Collection<Company, CompanyMeta>;
type CompanyMeta = {
  Base: CompanyModel;
  New: NewCompany;
  Persisted: Company;
  AssociationKey: 'employees';
  CreateInput: {
    id?: number;
    name: string;
    employees?: EmployeeModel[];
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
export class Employee extends EmployeeModel {};
export interface Employee extends EmployeeModel {
  id: number;
  name: string;
  companyId: number;
  company: Company;
};
type EmployeeCollection<T extends EmployeeModel> = Collection<T, EmployeeMeta> | Collection<Employee, EmployeeMeta>;
type EmployeeMeta = {
  Base: EmployeeModel;
  New: NewEmployee;
  Persisted: Employee;
  AssociationKey: 'company';
  CreateInput: {
    id?: number;
    name: string;
  } & ({ company: Company } | { companyId: number });
  WhereInput: {
    id?: number | number[] | Filter<number> | null;
    name?: string | string[] | StringFilter | null;
    companyId?: number | number[] | Filter<number> | null;
  };
  OrderInput: {
    id?: SortOrder;
    name?: SortOrder;
    companyId?: SortOrder;
  };
};
registerModel(Employee);
