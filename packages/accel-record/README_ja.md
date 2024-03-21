# Accel Record

Accel Recordは、型安全で同期的な、TypeScript用のORMです。 \
Active Recordパターンを採用しており、インターフェースはRuby on RailsのActiveRecordに強く影響を受けています。

スキーマ管理とマイグレーションにはPrismaを利用しており、既存のPrismaスキーマをそのまま利用することもできます。

MySQLとSQLiteをサポートしており、現在α版となっています。

## 特徴

- ActiveRecordパターン
- 型安全なクラス
- Native ESM
- 同期的なAPI
- MySQL, SQLiteのサポート

## 利用例

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

以下のようにドメインロジックを記述することができます。

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

また、モデルを拡張して自由にメソッドを定義できます。

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";

class UserModel extends ApplicationRecord {
  // フルネームを取得するメソッドを定義
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

MySQLでの例を記載します。

```sh
$ npm install accel-record mysql2
$ npx prisma init
```

以下のようにPrismaのスキーマを定義し、`initAccelRecord`を呼び出すことで、データベースに接続することができます。

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
import { User } from "../tests/models/index.js";

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
# tsxを使って.tsファイルを実行する例
$ npm i -D tsx
$ npx tsx src/index.ts
New user created! User.count is 1
```

## Examples

### データの作成と保存

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

### データの取得

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

### データの更新

```ts
// src/index.ts
import { User } from "./models/index.js";

const user = User.first()!;

user.update({ age: 26 });

// You can also write it like this
user.age = 26;
user.save();
```

### データの削除

```ts
// src/index.ts
import { User } from "./models/index.js";

const user = User.first()!;

// Delete a record
user.delete();

// Alternatively, delete with associations
user.destroy();
```

## モデルの型

### NewModelとPersistedModel

Accel Recordでは、新規作成されたモデルと保存済みのモデルを区別するために、それぞれ`NewModel`と`PersistedModel`という型を提供しています。 \
スキーマ定義に応じて一部のプロパティにおいては、`NewModel`ではundefinedを許容し`PersistedModel`ではundefinedを許容しない型となります。 \
これにより、保存前のモデルと保存後のモデルをどちらも型安全に扱うことができます。

```ts
// src/index.ts
import { User, NewUser } from "./models/index.js";

/*
NewModelの例：
NewUser型 は新規作成された保存前のモデルを表し、以下のような型となります。

interface NewUser {
  id: number | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  age: number | undefined;
}
*/
const newUser: NewUser = User.build({});

/*
PersistedModelの例：
User型 は保存済みのモデルを表し、以下のような型となります。

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

上記のNewModelとPersistedModelは、BaseModelを継承しています。
BaseModelに定義されたメソッドは、NewModelとPersistedModelの両方で利用することができます。

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";

/*
BaseModelの例：
UserModelはNewUserとUserに対応するBaseModelとなります。
 */
class UserModel extends ApplicationRecord {
  // ここで定義したメソッドはNewUserとUserの両方で利用することができます。
  get fullName(): string {
    if (!this.firstName || !this.lastName) {
      // NewUserではfirstNameとlastNameがundefinedの可能性を考慮する必要があります。
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

またメソッドにthisの型を指定することで、PersistedModelのみで型安全に利用できるメソッドを定義することもできます。(この場合はTypeScriptの仕様により、getキーワードを利用することができません)

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";
import { User } from "./index.js";

class UserModel extends ApplicationRecord {
  // このメソッドはUserのみで型安全に利用することができ、NewUserで利用した場合には型エラーとなります。
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

### NewModelからPersistedModelへの変換

`save()`や`isPersisted()`等のメソッドを利用することで、NewModel型をPersistedModel型に変換することができます。

```ts
// src/index.ts
import { User, NewUser } from "./models/index.js";

// NewModel型のユーザーを用意
const user: NewUser = User.build({
  firstName: "John",
  lastName: "Doe",
});

if (user.save()) {
  // saveが成功した場合、NewModelはPersistedModelに変換されます。
  // このブロック中では、userはUser型として扱うことができます。
  console.log(user.id); // user.idは number型
} else {
  // saveが失敗した場合、NewModelはそのままの型です。
  // このブロック中では、userはNewUser型のままになります。
  console.log(user.id); // user.idは number | undefined型
}

const someFunc = (user: NewUser | User) => {
  if (user.isPersisted()) {
    // isPersisted()がtrueの場合、NewModelはPersistedModelに変換されます。
    // このブロック中では、userはUser型として扱うことができます。
    console.log(user.id); // user.idは number型
  } else {
    // isPersisted()がfalseの場合、NewModelはそのままの型です。
    // このブロック中では、userはNewUser型のままになります。
    console.log(user.id); // user.idは number | undefined型
  }
};
```

## Prismaスキーマとフィールドの型

Accel Recordはスキーマ定義にPrismaを利用していますが、各機能のサポート状況は以下の通りです。

| 機能                            | 記法        | サポート |
| ------------------------------- | ----------- | -------- |
| ID                              | @id         | ✅       |
| Multi-field ID (Composite ID)   | @@id        | -        |
| Table name mapping              | @@map       | ✅       |
| Column name mapping             | @map        | ✅       |
| Default value                   | @default    | ✅       |
| Updated at                      | @updatedAt  | ✅       |
| List                            | []          | ✅       |
| Optional                        | ?           | ✅       |
| Relation field                  |             | ✅       |
| Implicit many-to-many relations |             | ✅       |
| Enums                           | enum        | ✅       |
| Unsupported type                | Unsupported | -        |

フィールドタイプが必須の場合とオプションの場合で、NewModelとPersistedModelの型が異なります。

| type           | NewModel | PersistedModel  |
| -------------- | -------- | --------------- |
| Required Field | Nullable | **NonNullable** |
| Optional Field | Nullable | Nullable        |

また、デフォルト値の指定方法によってもNewModelとPersistedModelの型が異なります。

| arg             | NewModel        | PersistedModel  |
| --------------- | --------------- | --------------- |
| static value    | **NonNullable** | **NonNullable** |
| autoincrement() | Nullable        | **NonNullable** |
| now()           | Nullable        | **NonNullable** |
| dbgenerated()   | Nullable        | **NonNullable** |
| uuid()          | **NonNullable** | **NonNullable** |
| cuid()          | **NonNullable** | **NonNullable** |

以下に、モデル定義とそれに対応するNewModelとPersistedModelの例を示します。

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
