Language: [English](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README-ja.md)

# Accel Record Factory

This is a factory library for Accel Record.

## Getting Started

```bash
npm install -D accel-record-factory
```

Add the configuration for `prisma-generator-accel-record` to `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/prisma/client"
}

generator accelRecord {
  provider    = "prisma-generator-accel-record"
  output      = "../src/models"
  factoryPath = "../tests/factories" // Add the output destination for factory files
}
```

After modifying `prisma/schema.prisma`, run the following command:

```bash
npx prisma generate
```

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

The following factory file will be automatically generated:

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  // firstName: "MyString",
  // lastName: "MyString",
  // age: 1,
});

export { UserFactory as $User };
```

You can import and use the factory:

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

const newUser = $User.build();

const user = $User.create({
  firstName: "John",
  lastName: "Doe",
  age: 20,
});
```

## Usage

### Setting Default Values

You can set default values by passing them as the second argument to defineFactory.

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  firstName: "John", // Set default value
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

### Using Sequential Numbers

When setting default values with defineFactory, you can use a function to utilize sequential numbers.

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  firstName: (seq) => `User${seq}`, // Specify a function to use sequential numbers
});

export { UserFactory as $User };
```

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

const user1 = $User.build();
user1.firstName; // => "User1"

const user2 = $User.build();
user2.firstName; // => "User2"
```

### Generating Associations

By specifying a function for the default value, you can generate models with associations.

```ts
// prisma/schema.prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
  setting   Setting? // Associated model
}

model Setting {
  id     Int    @id @default(autoincrement())
  userId Int
  user   User   @relation(fields: [userId], references: [id])
  notify Boolean
}
```

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User, Setting } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  setting: () => Setting.build({ notify: true }), // Specify a function to generate the association
});

export { UserFactory as $User };
```

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

const user = $User.build();
user.setting.notify; // => true
```

### Traits

By specifying traits as the third argument to defineFactory, you can set multiple default values.

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(
  User,
  {
    firstName: "John",
    lastName: "Doe",
  },
  {
    traits: {
      // Specify the trait name
      foo: {
        firstName: "Foo",
        lastName: "Bar",
      },
    },
  }
);

export { UserFactory as $User };
```

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

const john = $User.build({});
john.firstName; // => "John"
john.lastName; // => "Doe"

const foo = $User.build({}, "foo"); // Use the trait
foo.firstName; // => "Foo"
foo.lastName; // => "Bar"
```
