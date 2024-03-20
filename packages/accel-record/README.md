# Accel Record

Accel Record is a type-safe and synchronous ORM for TypeScript. It adopts the Active Record pattern and is heavily influenced by Ruby on Rails' Active Record.

It uses Prisma for schema management and migration, and you can also use existing Prisma schemas as is.

It supports MySQL and SQLite and is currently in alpha version.

## Features

- Active Record pattern
- Type-safe classes
- Native ESM
- Synchronous API
- Support for MySQL and SQLite

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
// src/index.ts
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

class UserModel extends ApplicationRecord {
  // Define a method to get the full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
// src/index.ts
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
import { User } from "./models/index.js";

initAccelRecord({
  type: "mysql",
  datasourceUrl: process.env.DATABASE_URL,
}).then(() => {
  User.create({
    firstName: "John",
    lastName: "Doe",
  });
  console.log(`New user created! User.count is ${User.count()}`);
});
```

```sh
$ export DATABASE_URL="mysql://root:@localhost:3306/accel_test"
$ npx prisma migrate dev
# Example of executing .ts files using tsx
$ npm i -D tsx
$ npx tsx src/index.ts
New user created! User.count is 1
```

## Examples

### Creating and Saving Data

```ts
// src/index.ts
import { User } from "./models/index.js";

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

### Retrieving Data from the Database

```ts
// src/index.ts
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
// src/index.ts
import { User } from "./models/index.js";

const user = User.first()!;

user.update({ age: 26 });

// You can also write it like this
user.age = 26;
user.save();
```

### Deleting Data

```ts
// src/index.ts
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
// src/index.ts
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
class UserModel extends ApplicationRecord {
  // Methods defined here can be used by both `NewUser` and `User`.
  get fullName(): string {
    if (!this.firstName || !this.lastName) {
      // For `NewUser`, we need to consider the possibility of `firstName` and `lastName` being `undefined`.
      return undefined;
    }
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
// src/index.ts
import { User, NewUser } from "./models/index.js";

const newUser: NewUser = User.build({});
console.log(user.fullName); // => undefined

const user: User = User.first()!;
console.log(user.fullName); // => "John Doe"
```

You can also define methods that are type-safe and can only be used by `PersistedModel` by specifying the `this` type for the method. (In this case, the `get` keyword cannot be used due to TypeScript specifications)

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";
import { User } from "./index.js";

class UserModel extends ApplicationRecord {
  // This method can only be used by `User` and is type-safe. Using it with `NewUser` will result in a type error.
  fullName(this: User): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```ts
// src/index.ts
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
// src/index.ts
import { User, NewUser } from "./models/index.js";

// Prepare a user of NewModel type
const user: NewUser = User.build({
  firstName: "John",
  lastName: "Doe",
});

if (user.save()) {
  // If save is successful, the NewModel is converted to PersistedModel.
  // In this block, the user can be treated as User type.
} else {
  // If save fails, the NewModel remains the same type.
  // In this block, the user remains as NewUser type.
}

const someFunc = (user: NewUser | User) => {
  if (user.isPersisted()) {
    // If isPersisted() is true, the NewModel is converted to PersistedModel.
    // In this block, the user can be treated as User type.
  } else {
    // If isPersisted() is false, the NewModel remains the same type.
    // In this block, the user remains as NewUser type.
  }
};
```
