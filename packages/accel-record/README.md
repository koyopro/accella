Language: [English](https://github.com/koyopro/accella/blob/main/packages/accel-record/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accel-record/README-ja.md)

# Accel Record

Accel Record is a type-safe and synchronous ORM for TypeScript. It adopts the Active Record pattern and is heavily influenced by Ruby on Rails' Active Record.

It uses Prisma for schema management and migration, and you can also use existing Prisma schemas as is.

It can be used with MySQL, PostgreSQL, and SQLite.

## Features

- Active Record pattern
- Type-safe classes
- Native ESM
- Synchronous API
- Support for MySQL, PostgreSQL, and SQLite

## Table of Contents

- [Usage](#usage)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Examples](#examples)
- [Model Types](#model-types)
- [Prisma Schema and Field Types](#prisma-schema-and-field-types)
- [Type of Json Field](#type-of-json-field)
- [Associations](#associations)
- [Query Interface](#query-interface)
- [Scopes](#scopes)
- [Flexible Search](#flexible-search)
- [Testing](#testing)
- [Validation](#validation)
- [Callbacks](#callbacks)
- [Serialization](#serialization)
- [Bulk Insert](#bulk-insert)
- [Transactions](#transactions)
- [Lock](#lock)
- [Internationalization (I18n)](#internationalization-i18n)
- [Password Authentication](#password-authentication)
- [Form Objects](#form-objects)
- [Nullable Values Handling](#nullable-values-handling)
- [Future Planned Features](#future-planned-features)

## Usage

For example, if you define a User model like this:

```ts
// prisma/schema.prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
}
```

You can write domain logic as follows:

```ts
import { User } from "./models/index.js";

const user: User = User.create({
  firstName: "John",
  lastName: "Doe",
});

user.update({
  age: 26,
});

for (const user of User.all()) {
  console.log(user.firstName);
}

const john: User | undefined = User.findBy({
  firstName: "John",
  lastName: "Doe",
});

john.delete();
```

You can also extend models and define custom methods as you like.

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends ApplicationRecord {
  // Define a method to get the full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
import { User } from "./models/index.js";

const user = User.create({
  firstName: "John",
  lastName: "Doe",
});

console.log(user.fullName); // => "John Doe"
```

## Installation

1. Install the npm package:

   ```
   npm install accel-record
   ```

2. Install a database driver:

   - for **MySQL** or **MariaDB**

     ```
     npm install mysql2
     ```

   - for **PostgreSQL**

     ```
     npm install pg
     ```

   - for **SQLite**

     ```
     npm install better-sqlite3
     ```

## Quick Start

Here is an example for MySQL.

```sh
$ npm install accel-record mysql2
$ npx prisma init
```

By defining the Prisma schema as shown below and calling `initAccelRecord`, you can connect to the database.

```ts
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator custom_generator {
  provider = "prisma-generator-accel-record"
  output   = "../src/models"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int    @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
}
```

```ts
// src/index.ts
import { initAccelRecord } from "accel-record";
import { getDatabaseConfig, User } from "./models/index.js";

initAccelRecord(getDatabaseConfig()).then(() => {
  User.create({
    firstName: "John",
    lastName: "Doe",
  });
  console.log(`New user created! User.count is ${User.count()}`);
});
```

```sh
$ export DATABASE_URL="mysql://root:@localhost:3306/accel_test?timezone=Z"
$ npx prisma migrate dev
# Example of executing .ts files using tsx
$ npm i -D tsx
$ npx tsx src/index.ts
New user created! User.count is 1
```

## Examples

### Creating and Saving Data

```ts
import { NewUser, User } from "./models/index.js";

// Create a user
const user: User = User.create({
  firstName: "John",
  lastName: "Doe",
});
console.log(user.id); // => 1

// You can also write it like this
const user: NewUser = User.build({});
user.firstName = "Alice";
user.lastName = "Smith";
user.save();
console.log(user.id); // => 2
```

### Retrieving Data

```ts
import { User } from "./models/index.js";

const allUsers = User.all();
console.log(`IDs of all users: ${allUsers.map((u) => u.id).join(", ")}`);

const firstUser = User.first();
console.log(`Name of the first user: ${firstUser?.firstName}`);

const john = User.findBy({ firstName: "John" });
console.log(`ID of the user with the name John: ${john?.id}`);

const does = User.where({ lastName: "Doe" });
console.log(`Number of users with the last name Doe: ${does.count()}`);
```

### Updating Data

```ts
import { User } from "./models/index.js";

const user = User.first()!;

user.update({ age: 26 });

// You can also write it like this
user.age = 26;
user.save();
```

### Deleting Data

```ts
import { User } from "./models/index.js";

const user = User.first()!;

// Delete a record
user.delete();

// Alternatively, delete with associations
user.destroy();
```

## Model Types

### NewModel and PersistedModel

Accel Record provides two types, `NewModel` and `PersistedModel`, to distinguish between newly created and saved models. \
Depending on the schema definition, some properties in `NewModel` allow `undefined`, while `PersistedModel` does not. \
This allows you to handle both pre-save and post-save models in a type-safe manner.

```ts
import { User, NewUser } from "./models/index.js";

/*
Example of NewModel:
NewUser represents a pre-save model and has the following type:

interface NewUser {
  id: number | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  age: number | undefined;
}
*/
const newUser: NewUser = User.build({});

/*
Example of PersistedModel:
User represents a saved model and has the following type:

interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number | undefined;
}
*/
const persistedUser: User = User.first()!;
```

### BaseModel

The above `NewModel` and `PersistedModel` inherit from `BaseModel`. \
Methods defined in `BaseModel` can be used by both `NewModel` and `PersistedModel`.

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";

/*
Example of BaseModel:
UserModel corresponds to `NewUser` and `User` in `BaseModel`.
 */
export class UserModel extends ApplicationRecord {
  // Methods defined here can be used by both `NewUser` and `User`.
  get fullName(): string | undefined {
    if (!this.firstName || !this.lastName) {
      // For `NewUser`, we need to consider the possibility of `firstName` and `lastName` being `undefined`.
      return undefined;
    }
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
import { User, NewUser } from "./models/index.js";

const newUser: NewUser = User.build({});
console.log(newUser.fullName); // => undefined

const user: User = User.first()!;
console.log(user.fullName); // => "John Doe"
```

You can also define methods that are type-safe and can only be used by `PersistedModel` by specifying the `this` type for the method. (In this case, the `get` keyword cannot be used due to TypeScript specifications)

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";
import { User } from "./index.js";

export class UserModel extends ApplicationRecord {
  // This method can only be used by `User` and is type-safe. Using it with `NewUser` will result in a type error.
  fullName(this: User): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
import { User, NewUser } from "./models/index.js";

const newUser: NewUser = User.build({});
// @ts-expect-error
newUser.fullName();
// => The 'this' context of type 'NewUser' is not assignable to method's 'this' of type 'User'.

const user: User = User.first()!;
console.log(user.fullName()); // => "John Doe"
```

### Converting from NewModel to PersistedModel

By using methods like `save()` and `isPersisted()`, you can convert a `NewModel` type to a `PersistedModel` type.

```ts
import { User, NewUser } from "./models/index.js";

// Prepare a user of NewModel type
const user: NewUser = User.build({
  firstName: "John",
  lastName: "Doe",
});

if (user.save()) {
  // If save is successful, the NewModel is converted to PersistedModel.
  // In this block, the user can be treated as User type.
  console.log(user.id); // user.id is of type number
} else {
  // If save fails, the NewModel remains the same type.
  // In this block, the user remains as NewUser type.
  console.log(user.id); // user.id is of type number | undefined
}

const someFunc = (user: NewUser | User) => {
  if (user.isPersisted()) {
    // If isPersisted() is true, the NewModel is converted to PersistedModel.
    // In this block, the user can be treated as User type.
    console.log(user.id); // user.id is of type number
  } else {
    // If isPersisted() is false, the NewModel remains the same type.
    // In this block, the user remains as NewUser type.
    console.log(user.id); // user.id is of type number | undefined
  }
};
```

## Prisma Schema and Field Types

Accel Record uses Prisma for schema definition, and the support status for each feature is as follows:

| Feature                         | Notation    | Support |
| ------------------------------- | ----------- | ------- |
| ID                              | @id         | ✅      |
| Multi-field ID (Composite ID)   | @@id        | ✅      |
| Table name mapping              | @@map       | ✅      |
| Column name mapping             | @map        | ✅      |
| Default value                   | @default    | ✅      |
| Updated at                      | @updatedAt  | ✅      |
| List                            | []          | ✅      |
| Optional                        | ?           | ✅      |
| Relation field                  |             | ✅      |
| Implicit many-to-many relations |             | ✅      |
| Enums                           | enum        | ✅      |
| Unsupported type                | Unsupported | -       |

The types of NewModel and PersistedModel differ depending on whether the field type is required or optional.

| Type           | NewModel | PersistedModel  |
| -------------- | -------- | --------------- |
| Required Field | Nullable | **NonNullable** |
| Optional Field | Nullable | Nullable        |

In addition, the types of NewModel and PersistedModel differ depending on how the default value is specified.

| Argument        | NewModel        | PersistedModel  |
| --------------- | --------------- | --------------- |
| Static value    | **NonNullable** | **NonNullable** |
| autoincrement() | Nullable        | **NonNullable** |
| now()           | Nullable        | **NonNullable** |
| dbgenerated()   | Nullable        | **NonNullable** |
| uuid()          | **NonNullable** | **NonNullable** |
| cuid()          | **NonNullable** | **NonNullable** |

Here are examples of model definitions and their corresponding NewModel and PersistedModel:

```ts
// prisma/schema.prisma

model Sample {
  id         Int      @id @default(autoincrement())
  required   Int
  optional   String?
  hasDefault Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  uuid       String   @default(uuid())
  cuid       String   @default(cuid())
}
```

```ts
// NewModel
interface NewSample {
  id: number | undefined;
  required: number | undefined;
  optional: string | undefined;
  hasDefault: boolean;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  uuid: string;
  cuid: string;
}

// PersistedModel
interface Sample {
  id: number;
  required: number;
  optional: string | undefined;
  hasDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
  cuid: string;
}
```

## Type of Json Field

When defining a Json type in a typical Prisma schema, you cannot specify strict types.

```ts
// prisma/schema.prisma
model Sample {
  id   Int  @id @default(autoincrement())
  data Json // you don't have strict type for Json field
}
```

With Accel Record, you can specify the type for Json fields in the BaseModel. \
In this case, you can handle Json fields in a type-safe manner for both reading and writing.

```ts
// src/models/sample.ts
import { ApplicationRecord } from "./applicationRecord.js";

export class SampleModel extends ApplicationRecord {
  // You can specify the type for Json fields in the BaseModel
  data: { myKey1: string; myKey2: number } | undefined = undefined;
}
```

```ts
import { Sample } from "./models/index.js";

const sample = Sample.build({});

// OK
sample.data = { myKey1: "value1", myKey2: 123 };

// Type Error !
sample.data = { foo: "value1" };
// => Type '{ foo: string; }' is not assignable to type '{ myKey1: string; myKey2: number; } | undefined'.

// OK
console.log(sample.data?.myKey1);

// Type Error !
console.log(sample.data?.foo);
// => Property 'foo' does not exist on type '{ myKey1: string; myKey2: number; } | undefined'.
```

## Associations

Below are examples of operations on models with associations.

### One-to-One Relationship

```ts
// prisma/schema.prisma
model User {
  id      Int    @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

```ts
import { User, Profile } from "./models/index.js";

const user = User.create({});

// Saving the association (Pattern 1)
const profile = Profile.create({ user });

// Saving the association (Pattern 2)
user.profile = Profile.build({});

// Saving the association (Pattern 3)
user.update({ profile: Profile.build({}) });

// Retrieving the association
user.profile;

profile.user;

// Deleting the association (Pattern 1)
user.profile?.destroy();

// Deleting the association (Pattern 2)
user.profile = undefined;
```

### One-to-Many Relationship

```ts
// prisma/schema.prisma
model User {
  id       Int      @id @default(autoincrement())
  posts    Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  userId Int
  user   User   @relation(fields: [userId], references: [id])
}
```

```ts
import { User, Post } from "./models/index.js";

const user = User.create({});

// Saving the association (Pattern 1)
const post = Post.create({ user });

// Saving the association (Pattern 2)
user.posts.push(Post.build({}));

// Saving the association (Pattern 3)
user.posts = [Post.build({})];

// Retrieving the association
user.posts.toArray();

post.user;

// Deleting the association (Pattern 1)
user.posts.destroy(post);

// Deleting the association (Pattern 2)
post.destroy();
```

### Many-to-Many Relationship

In Prisma schema, there are two ways to define Many-to-Many relationships: explicit and implicit.

For explicit Many-to-Many relationships, you define an intermediate table.
In this case, you would operate in a similar way as the previous One-to-Many relationship.

Here is an example of an implicit Many-to-Many relationship.

```ts
// prisma/schema.prisma
model User {
  id     Int     @id @default(autoincrement())
  groups Group[]
}

model Group {
  id    Int    @id @default(autoincrement())
  users User[]
}
```

```ts
import { User, Group } from "./models/index.js";

const user = User.create({});
const group = Group.create({});

// Saving the association (Pattern 1)
user.groups.push(group);

// Saving the association (Pattern 2)
user.groups = [group];

// Saving the association (Pattern 3)
group.users.push(user);

// Saving the association (Pattern 4)
group.users = [user];

// Retrieving the association
user.groups.toArray();

group.users.toArray();

// Deleting the association (Pattern 1)
user.groups.destroy(group);

// Deleting the association (Pattern 2)
group.users.destroy(user);
```

## Query Interface

### Model Query Interface

Here are some examples of using the interface to perform queries on models.
Each method allows you to query the model in a type-safe manner using information generated from the model definition.
You can also take advantage of IDE autocompletion.

For more details, refer to the list of methods in the Relation class.

```ts
import { User } from "./models/index.js";

User.where({
  name: "John",
  age: { ">=": 18 },
  email: { endsWith: "@example.com" },
})
  .order("createdAt", "desc")
  .includes("posts", "setting")
  .offset(10)
  .limit(10);

User.where({ name: ["John", "Alice"] }).exists();

User.joins("profile").where("Profile.name = ?", "John").count();

User.first()?.posts.destroyAll();
```

The model query interface does not currently support features like GROUP BY.
This is because these queries have limited benefits from using schema type information.

If you need to execute queries that cannot be achieved with the model query interface, please use raw SQL or the Knex QueryBuilder explained below.

### Executing Raw SQL Queries

You can use the `Model.connection.execute()` method to execute raw SQL queries and synchronously retrieve the results.

```ts
import { Model } from "accel-record";

const rows = Model.connection.execute(
  `select firstName, count(id) as cnt
   from User
   group by firstName`,
  []
);

console.log(rows);
// => [{ firstName: "John", cnt: 1 }, { firstName: "Alice", cnt: 2 }]
```

### Executing Queries with Knex QueryBuilder

You can use Knex to build and execute queries.
We have added an `execute()` method to Knex's QueryBuilder, which allows you to execute queries synchronously.

For more details on the functionality, refer to the following link:
[Knex Query Builder | Knex.js](https://knexjs.org/guide/query-builder.html)

```ts
import { Model } from "accel-record";
import { User } from "./models/index.js";

// You can obtain an instance of Knex with Model.connection.knex.
const knex = Model.connection.knex;
const rows = knex
  .select("name", knex.raw("SUM(score) as total"))
  .from("Score")
  .groupBy("name")
  .execute();

console.log(rows);
// => [{ name: "John", total: "1" }, { name: "Alice", total: "2" }]

// You can perform queries on the corresponding tables for each model using the queryBuilder property.
const rows = User.queryBuilder.select("name").groupBy("name").execute();

console.log(rows); // => [{ name: "John" }, { name: "Alice" }]
```

## Scopes

You can define the content of reusable queries as scopes.

To define a scope, create a static class method on the model and decorate it with `@scope`.
After that, run `prisma generate` to reflect the scopes in the query interface.

```ts
// src/models/user.ts

import { scope } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends ApplicationRecord {
  @scope
  static johns() {
    return this.where({ name: "John" });
  }

  @scope
  static adults() {
    return this.where({ age: { ">=": 20 } });
  }
}
```

With the above definition, you can use the scopes as follows:

```ts
import { User } from "./models/index.js";

// Get the count of users with name "John" and age greater than or equal to 20
User.johns().adults().count(); // => 1
```

## Flexible Search

Using the `.search()` method, you can perform object-based flexible searches.
(The interface is inspired by the Ransack gem.)

Search parameters are specified as an object with keys representing the field name and search condition combination strings, and values representing the search values.
You can include associations in the keys.
The search conditions include `eq`, `cont`, `matches`, `lt`, `gte`, `in`, `null`, and more.
In addition, modifiers such as `not`, `or`, `and`, `any`, `all` are also available.
Please refer to the documentation of the search() method for more details.

```ts
import { User } from "./models/index.js";

const search = User.search({
  name_eq: "John", // name equals "John"
  age_not_null: 1, // age is not null
  profile_bio_cont: "foo", // related profile's bio contains "foo"
  email_or_name_cont_any: ["bar", "baz"], // email or name contains "bar" or "baz"
});
const users = search.result();
```

Additionally, you can include the names of searchable scopes defined in the `searchableScopes` array as keys in the search parameters.

For example, the `bio_cont` scope defined as follows can be used in the search parameters:

```ts
// src/models/user.ts

import { scope } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

class UserModel extends ApplicationRecord {
  @scope
  static bio_cont(value: string) {
    return this.joins("profile").where({
      profile: { bio: { contains: value } },
    });
  }
  static searchableScopes = ["bio_cont"];
}
```

```ts
import { User } from "./models/index.js";

const search = User.search({ bio_cont: "foo" }); // profile's bio contains "foo"
const users = search.result();
```

## Testing

### Testing with Vitest

In Vitest, you prepare a setup file like the following for testing.

```ts
// tests/vitest.setup.ts

import { DatabaseCleaner, Migration, initAccelRecord, stopWorker } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import { getDatabaseConfig } from "../src/models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(async () => {
  await initAccelRecord({
    ...getDatabaseConfig(), // type and prismaDir are automatically set based on the schema.prisma file.

    // Vitest usually performs tests in a multi-threaded manner.
    // To use different databases in each thread, separate the databases using VITEST_POOL_ID.
    datasourceUrl: `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}?timezone=Z`,
  });
  // If prismaDir is specified in initAccelRecord, you can execute pending migrations.
  await Migration.migrate();
});

// Use DatabaseCleaner in beforeEach and afterEach to clean up the database for each test.
beforeEach(async () => {
  DatabaseCleaner.start();
});

afterEach(async () => {
  DatabaseCleaner.clean();
});

// Call stopWorker in afterAll to stop the synchronous subprocess at the end of the test.
afterAll(async () => {
  stopWorker();
});
```

By specifying the above file in the setupFiles of the Vitest configuration file, you can initialize the database before running the tests.
For more details, refer to the [Vitest documentation](https://vitest.dev/config/#setupfiles).

```js
// vitest.config.js

export default {
  test: {
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"], // Add here
    // ...
  },
  // ...
};
```

### Model Factory

To generate test records, you can use a Factory.  
Please refer to [accel-record-factory](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README.md) for more details.

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  firstName: "John",
  lastName: "Doe",
  age: 20,
});

export { UserFactory as $User };
```

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

const newUser = $User.build();
newUser.firstName; // => "John"
newUser.lastName; // => "Doe"
newUser.age; // => 20
```

## Validation

### Sample Validation

Here is an example of validation for a model.

```ts
// src/models/user.ts
import { validates } from "accel-record/validations";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends ApplicationRecord {
  static validations = validates(this, [["firstName", { presence: true }]]);
}
```

```ts
import { User } from "./models/index.js";

const user = User.build({ firstName: "" });
user.isValid(); // => false
user.errors.fullMessages(); // => ["FirstName can't be blank"]

user.firstName = "John";
user.isValid(); // => true
```

### Validation Execution Timing

When using the `save`, `update`, and `create` methods, validation is automatically executed, and the saving process is only performed if there are no errors.

```ts
import { User } from "./models/index.js";

// If a validation error occurs, save or update will return false.
const newUser = User.build({ firstName: "" });
newUser.save(); // => false
newUser.errors.fullMessages(); // => ["FirstName can't be blank"]

const user = User.first()!;
user.update({ firstName: "" }); // => false
newUser.errors.fullMessages(); // => ["FirstName can't be blank"]

// If a validation error occurs, create will throw an exception.
User.create({ firstName: "" }); // => Error: Failed to create
```

### Validation Definition

You can define validations by using the `validates()` function and adding a `validations` property to the model class. Alternatively, you can override the `validateAttributes()` method of the BaseModel.

```ts
// prisma/schema.prisma
model ValidateSample {
  id       Int     @id @default(autoincrement())
  accepted Boolean
  pattern  String
  key      String
  count    Int
  size     String
}
```

```ts
// ./models/validateSample.ts
import { Validator } from "accel-record";
import { validates } from "accel-record/validations";
import { ApplicationRecord } from "./applicationRecord.js";

export class ValidateSampleModel extends ApplicationRecord {
  static validations = validates(this, [
    // Common validations can be easily written using validation helpers.
    ["accepted", { acceptance: true }],
    [
      "pattern",
      {
        length: { minimum: 2, maximum: 5 },
        format: { with: /^[a-z]+$/, message: "only allows lowercase letters" },
      },
    ],
    ["size", { inclusion: { in: ["small", "medium", "large"] } }],
    [["key", "size"], { presence: true }],

    // Example of using a custom validator
    MyValidator,
  ]);

  // You can also override the validateAttributes method to define validations.
  override validateAttributes() {
    this.validates("key", { uniqueness: true });

    // If you want to perform custom validation logic, use the errors.add method to add error messages.
    if (this.key && !/^[a-z]$/.test(this.key[0])) {
      this.errors.add("key", "should start with a lowercase letter");
    }
  }
}

// Custom validators inherit from Validator and implement the validate method.
class MyValidator extends Validator<{ key: string | undefined }> {
  validate() {
    if (this.record.key === "xs") {
      this.errors.add("key", "should not be xs");
    }
  }
}
```

## Callbacks

By using the `before` and `after` decorators, you can define callbacks in your models to perform actions before or after validation or saving records.
The targets for callbacks are `validation`, `save`, `create`, `update`, and `destroy`.
The feature is available in environments where Stage 3 decorators, implemented in TypeScript 5.0, are supported.

```ts
// ./models/callbackSample.ts
import { ApplicationRecord } from "./applicationRecord.js";

export class CallbackSampleModel extends ApplicationRecord {
  @before("save")
  beforeSave() {
    // this method is called before save
  }

  @after("create")
  afterCreate() {
    // this method is called after create
  }
}
```

## Serialization

By using the `toHash` and `toHashArray` methods, you can convert the model's data into plain objects.

```ts
import { User } from "./models/index.js";

const userHash = User.first()!.toHash({
  only: ["firstName", "lastName"],
  include: { posts: { only: ["title"] } },
});
console.log(userHash);
// => { firstName: "John", lastName: "Doe", posts: [{ title: "Hello" }] }

const usersHashArray = User.all().toHashArray({
  only: ["firstName", "lastName"],
});
console.log(usersHashArray);
// => [{ firstName: "John", lastName: "Doe" }, { firstName: "Alice", lastName: "Smith" }]
```

By using the `toJson` method, you can convert the model's data into a JSON string.

```ts
import { User } from "./models/index.js";

const userJson = User.first()!.toHah({
  only: ["firstName", "lastName"],
  include: { posts: { only: ["title"] } },
});
console.log(userJson);
// => {"firstName":"John","lastName":"Doe","posts":[{"title":"Hello"}]}

const usersJson = User.all().toHashArray({
  only: ["firstName", "lastName"],
});
console.log(usersJson);
// => [{"firstName":"John","lastName":"Doe"},{"firstName":"Alice","lastName":"Smith"}]
```

## Bulk Insert

Bulk Insert is a feature that allows you to insert multiple records into the database at once. \
In Accel Record, you can use the `import()` method to perform Bulk Insert.

```ts
import { User } from "./models/index.js";

const users = [
  User.build({ id: 1, firstName: "Foo", lastName: "Bar" }),
  User.build({ id: 2, firstName: "John", lastName: "Doe" }),
];

User.import(users, {
  onDuplicateKeyUpdate: ["firstName", "lastName"],
  validate: "throw",
});
```

## Transactions

You can use the `Model.transaction()` method to utilize transactions. By throwing a `Rollback` exception, you can rollback the transaction, and transactions can be nested.

```ts
import { Rollback } from "accel-record";
import { User } from "./models/index.js";

User.transaction(() => {
  User.create({});
  console.log(User.count()); // => 1

  User.transaction(() => {
    User.create({});
    console.log(User.count()); // => 2

    // The inner transaction is rolled back by throwing a Rollback
    throw new Rollback();
  });
  // The outer transaction is committed
});
console.log(User.count()); // => 1
```

## Lock

You can perform row locking using the `lock()` and `withLock()` methods. (Supported in MySQL and PostgreSQL)

```ts
import { User } from "./models/index.js";

User.transaction(() => {
  const user1 = User.lock().find(1);
  const user2 = User.lock().find(2);

  user1.point += 100;
  user2.point -= 100;

  user1.save();
  user2.save();
});
```

```ts
const user = User.find(1);
user.withLock(() => {
  user.update({ name: "bar" });
});
```

## Internationalization (I18n)

We provide internationalization functionality using [`i18next`](https://www.i18next.com).

You can reference the translation of model names and attribute names by using the `Model.model_name.human` method and the `Model.human_attribute_name(attribute)` method.

```ts
import i18next from "i18next";
import { User } from "./models/index.js";

i18next
  .init({
    lng: "en",
    resources: {
      en: {
        translation: {
          "accelrecord.models.User": "User",
          "accelrecord.attributes.User.firstName": "First Name",
          "accelrecord.attributes.User.lastName": "Last Name",
        },
      },
    },
  })
  .then(() => {
    console.log(User.modelName.human); // => "User"
    console.log(User.humanAttributeName("firstName")); // => "First Name"
  });
```

### Translation of Error Messages

Validation error messages are also translatable and can be referenced using the following keys:

```
accelrecord.errors.models.[ModelName].attributes.[attribute].[messageKey]
accelrecord.errors.models.[ModelName].[messageKey]
accelrecord.errors.messages.[messageKey]
errors.attributes.[attribute].[messageKey]
errors.messages.[messageKey]
```

```ts
import { validates } from "accel-record/validations";
import { ApplicationRecord } from "./applicationRecord.js";

class UserModel extends ApplicationRecord {
  static validations = validates(this, [["firstName", { presence: true }]]);
}
```

In the example above, the translation of the message key `'blank'` will be used for the error message.

In this example, the following keys will be searched in order, and the first key found will be used:

```
accelrecord.errors.models.User.attributes.name.blank
accelrecord.errors.models.User.blank
accelrecord.errors.messages.blank
errors.attributes.name.blank
errors.messages.blank
```

```ts
import i18next from "i18next";
import { User } from "./models/index.js";

i18next
  .init({
    lng: "en",
    resources: {
      en: {
        translation: {
          "accelrecord.models.User": "User",
          "accelrecord.attributes.User.firstName": "First Name",
          "accelrecord.attributes.User.lastName": "Last Name",
          "accelrecord.errors.messages.blank": "can't be blank", // Add
        },
      },
    },
  })
  .then(() => {
    const user = User.build({});
    user.validate();
    console.log(User.errors.fullMessages);
    // => ["First Name can't be blank"]
  });
```

The message keys corresponding to each validation are as follows:

| Validation   | Option    | Message Key | Interpolation |
| ------------ | --------- | ----------- | ------------- |
| acceptance   | -         | 'accepted'  | -             |
| presence     | -         | 'blank'     | -             |
| length       | 'minimum' | 'tooShort'  | count         |
| length       | 'maximum' | 'tooLong'   | count         |
| uniqueness   | -         | 'taken'     | -             |
| format       | -         | 'invalid'   | -             |
| inclusion    | -         | 'inclusion' | -             |
| numericality | 'equalTo' | 'equalTo'   | count         |

For those with interpolation set to `count`, that part will be replaced with the value specified in the option when the error message contains `{{count}}`.

### Translation of Enums

You can define translations for each value of an Enum.

```ts
// prisma/schema.prisma

enum Role {
  MEMBER
  ADMIN
}

model User {
  /* ... */
  role Role @default(MEMBER)
}
```

You can use `User.role.options()` to retrieve the translations corresponding to each value of the Enum.
For each `User` with a `role`, you can retrieve the translation corresponding to the Enum value using the `roleText` property.

```ts
import i18next from "i18next";
import { User } from "./models/index.js";

i18next
  .init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          "enums.User.Role.MEMBER": "Member",
          "enums.User.Role.ADMIN": "Admin",
        },
      },
    },
  })
  .then(() => {
    User.role.options(); // => [["Member", "MEMBER"], ["Admin", "ADMIN"]]

    const user = User.build({});
    user.role; // => "MEMBER"
    user.roleText; // => "Member"
  });
```

In the example of `user.role`, the following keys will be searched in order, and the first key found will be used:

```
enums.User.Role.MEMBER
enums.defaults.Role.MEMBER
enums.Role.MEMBER
```

## Password Authentication

We provide a mechanism for securely hashing and authenticating passwords using Bcrypt.

First, add a `passwordDigest` field to the model to store the hashed password.

```ts
// prisma/schema.prisma
model User {
  ...
  passwordDigest String // Stores the hash value of the password
}
```

Next, use `hasSecurePassword()` to add functionality to the model for hashing and authenticating passwords.

```ts
// ./models/user.ts
import { hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends Mix(ApplicationRecord, hasSecurePassword()) {}
```

With this, you can perform password validation and hashing using the `password` and `passwordConfirmation` fields, and authenticate passwords using the `authenticate()` method.

```ts
import { User } from "./models/index.js";

const user = User.build({});
user.password = "";
user.save(); // => false (password can't be blank)
user.password = "myPassword";
user.save(); // => false (password confirmation doesn't match)
user.passwordConfirmation = "myPassword";
user.save(); // => true

user.authenticate("invalid"); // => false
user.authenticate("myPassword"); // => true
```

You can customize the field name for storing the password by setting it to something other than `passwordDigest`, and you can manage multiple passwords in the model as well.

```ts
// ./models/user.ts
import { hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends Mix(
  ApplicationRecord,
  hasSecurePassword(), // Uses the passwordDigest field
  hasSecurePassword({ attribute: "recovery", validation: false }) // Uses the recoveryDigest field
) {}
```

## Form Objects

Form objects are a design pattern that allows you to separate validation and saving logic from regular models. They are used for handling processes that span multiple models or for handling form processing that doesn't correspond to regular models.
By inheriting from the `FormModel` class, you can define attributes and perform validations just like regular models, even though the form object is not directly related to a database table.

```ts
import { FormModel } from "accel-record";
import { attributes } from "accel-record/attributes";
import { validates } from "accel-record/validations";

class MyForm extends FormModel {
  title = attributes.string();
  priority = attributes.integer(3);
  dueDate = attributes.date();

  static validations = validates(this, [
    ["title", { presence: true }],
    ["priority", { numericality: { between: [1, 5] } }],
  ]);

  save() {
    if (this.isInvalid()) return false;

    // Perform actions when validation succeeds
    // Save values to models, etc.
    // ...
    return true;
  }
}
```

```ts
// Receive form input values
const myFormParams = { title: "Task", priority: "2", dueDate: "2022-12-31" };
const form = MyForm.build(myFormParams);
if (form.save()) {
  // Actions to take on successful save
  /* ... */
} else {
  // Actions to take on save failure
  const errorMessages = form.errors.fullMessages();
  // Display error messages, etc.
  /* ... */
}
```

## Nullable Values Handling

Regarding nullable values, TypeScript, like JavaScript, has two options: undefined and null. \
For Accel Record, there is no need to use null, and nullable values are consistently represented as undefined.
This is mainly to avoid the complexity of mixing null and undefined. \
While we understand that there are benefits to using undefined and null differently, we prioritize code readability and maintainability by avoiding the complexity of types.

```ts
import { User } from "./models/index.js";

// Optional fields have undefined as their default value.
const newUser = User.build({});
newUser.age; // => undefined

// You can also specify undefined to search for records with null values in the database.
const user = User.findBy({ age: undefined })!;

// Fields with null values in the database are treated as undefined.
user.age; // => undefined

// By specifying undefined for optional fields, you can update the value to null in the database.
user.update({ age: undefined });
```

## Future Planned Features

[Accel Record Roadmap](https://github.com/koyopro/accella/issues/1)

## Background of Design and Development

Introducing articles about the motivation behind the design and development of Accel Record.

- [Introduction to "Accel Record": A TypeScript ORM Using the Active Record Pattern](https://dev.to/koyopro/introduction-to-accel-record-a-typescript-orm-using-the-active-record-pattern-2oeh)
- [Seeking a Type-Safe Ruby on Rails in TypeScript, I Started Developing an ORM](https://dev.to/koyopro/seeking-a-type-safe-ruby-on-rails-in-typescript-i-started-developing-an-orm-1of5)
- [Why We Adopted a Synchronous API for the New TypeScript ORM](https://dev.to/koyopro/why-we-adopted-a-synchronous-api-for-the-new-typescript-orm-1jm)
- [Even Server-Side TypeScript Needs the Option to Avoid Asynchronous Processing](https://dev.to/koyopro/even-server-side-typescript-needs-the-option-to-avoid-asynchronous-processing-1opm)
