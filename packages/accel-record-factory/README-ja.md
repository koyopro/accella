Language: [English](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README-ja.md)

# Accel Record Factory

Accel Record用のファクトリーライブラリです。

## Getting Started

```bash
npm install -D accel-record-factory
```

`prisma/schema.prisma` へ `prisma-generator-accel-record` の設定を追加します。

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/prisma/client"
}

generator accelRecord {
  provider    = "prisma-generator-accel-record"
  output      = "../src/models"
  factoryPath = "../tests/factories" // ファクトリーファイルの出力先を追加
}
```

`prisma/schema.prisma` を変更したら、以下のコマンドを実行してください。

```bash
npx prisma generate
```

例えば以下のようにUserモデルを定義した場合、

```ts
// prisma/schema.prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
}
```

以下のようなファクトリーファイルが自動生成されます。

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

ファクトリーをインポートして使用することができます。

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

## 使い方

### デフォルト値の設定

defineFactoryの第二引数にデフォルト値を設定することができます。

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  firstName: "John", // デフォルト値を設定
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

### 連番の利用

defineFactoryでデフォルト値を設定する際に、関数を指定することで連番を利用することができます。

```ts
// tests/factories/user.ts

import { defineFactory } from "accel-record-factory";
import { User } from "../../src/models/index.js";

export const UserFactory = defineFactory(User, {
  firstName: (seq) => `User${seq}`, // 連番を利用する関数を指定
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

### 関連の生成

デフォルト値に関数を指定することで、関連を持つモデルを生成することができます。

```ts
// prisma/schema.prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String
  lastName  String
  age       Int?
  setting   Setting? // 関連を持つモデル
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
  setting: () => Setting.build({ notify: true }), // 関連を生成する関数を指定
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

defineFactoryの第三引数にtraitsを指定することで、複数種類のデフォルト値を設定することができます。

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
      // trait名を指定
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

const foo = $User.build({}, "foo"); // traitを使用する
foo.firstName; // => "Foo"
foo.lastName; // => "Bar"
```
