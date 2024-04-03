# Accel Record

Accel Recordは、型安全で同期的な、TypeScript用のORMです。 \
Active Recordパターンを採用しており、インターフェースはRuby on RailsのActiveRecordに強く影響を受けています。

スキーマ管理とマイグレーションにはPrismaを利用しており、既存のPrismaスキーマをそのまま利用することもできます。

MySQLとSQLiteをサポートしており、現在β版となっています。

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

export class UserModel extends ApplicationRecord {
  // フルネームを取得するメソッドを定義
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

### データの取得

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

### データの更新

```ts
import { User } from "./models/index.js";

const user = User.first()!;

user.update({ age: 26 });

// You can also write it like this
user.age = 26;
user.save();
```

### データの削除

```ts
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
export class UserModel extends ApplicationRecord {
  // ここで定義したメソッドはNewUserとUserの両方で利用することができます。
  get fullName(): string | undefined {
    if (!this.firstName || !this.lastName) {
      // NewUserではfirstNameとlastNameがundefinedの可能性を考慮する必要があります。
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

またメソッドにthisの型を指定することで、PersistedModelのみで型安全に利用できるメソッドを定義することもできます。(この場合はTypeScriptの仕様により、getキーワードを利用することができません)

```ts
// src/models/user.ts
import { ApplicationRecord } from "./applicationRecord.js";
import { User } from "./index.js";

export class UserModel extends ApplicationRecord {
  // このメソッドはUserのみで型安全に利用することができ、NewUserで利用した場合には型エラーとなります。
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

### NewModelからPersistedModelへの変換

`save()`や`isPersisted()`等のメソッドを利用することで、NewModel型をPersistedModel型に変換することができます。

```ts
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

## Jsonフィールドの型

通常PrismaスキーマでJson型を定義する場合、厳密な型を指定できません。

```ts
// prisma/schema.prisma
model Sample {
  id   Int  @id @default(autoincrement())
  data Json // Jsonフィールドには厳密な型がありません
}
```

Accel RecordではBaseModelにおいてJson型のフィールドに対して型を指定することができます。 \
この場合は、Json型のフィールドも読み書きともに型安全に扱うことができます。

```ts
// src/models/sample.ts
import { ApplicationRecord } from "./applicationRecord.js";

export class SampleModel extends ApplicationRecord {
  // BaseModel上でJson型のフィールドに対して型を指定できる
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

## 関連付け

以下に、関連付けを持つモデルに対する操作の例を示します。

### One-to-One リレーション

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

// 関連の保存(パターン1)
const profile = Profile.create({ user });

// 関連の保存(パターン2)
user.profile = Profile.build({});

// 関連の保存(パターン3)
user.update({ profile: Profile.build({}) });

// 関連の取得
user.profile;

profile.user;

// 関連の削除(パターン1)
user.profile?.destroy();

// 関連の削除(パターン2)
user.profile = undefined;
```

### One-to-Many リレーション

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

// 関連の保存(パターン1)
const post = Post.create({ user });

// 関連の保存(パターン2)
user.posts.push(Post.build({}));

// 関連の保存(パターン3)
user.posts = [Post.build({})];

// 関連の取得
user.posts.toArray();

post.user;

// 関連の削除(パターン1)
user.posts.destroy(post);

// 関連の削除(パターン2)
post.destroy();
```

### Many-to-Many リレーション

Prismaスキーマでは、明示的なMany-to-Manyリレーションと、非明示的なMany-to-Manyリレーションの2つの方法があります。

明示的なMany-to-Manyリレーションの場合、中間テーブルを定義します。
この場合は、前項のOne-to-Manyリレーションと同様に操作することになります。

以下では、非明示的なMany-to-Manyリレーションの例を示します。

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

// 関連の保存(パターン1)
user.groups.push(group);

// 関連の保存(パターン2)
user.groups = [group];

// 関連の保存(パターン3)
group.users.push(user);

// 関連の保存(パターン4)
group.users = [user];

// 関連の取得
user.groups.toArray();

group.users.toArray();

// 関連の削除(パターン1)
user.groups.destroy(group);

// 関連の削除(パターン2)
group.users.destroy(user);
```

## クエリインターフェース

### モデルのクエリインターフェース

モデルに対するクエリを行うためのインターフェースの利用例を示します。
各メソッドではモデル定義から生成された情報を利用し、型安全にクエリを行うことができます。
また、IDEの補完機能も利用することができます。

より詳細についてはRelationクラスのメソッド一覧を参照してください。

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

モデルのクエリインターフェースでは、GROUP BY等の機能は現在サポートされていません。
これらのクエリではスキーマの型情報を利用するメリットが少ないためです。

モデルのクエリインターフェースでは実現できないクエリを実行する場合は、以下で説明する生SQLやKnexのQueryBuilderを使ったクエリ実行を利用してください。

### 生SQLのクエリ実行

`Model.connection.execute()` メソッドを利用することで生のSQLクエリを実行し、同期的に結果を取得することができます。

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

### KnexのQueryBuilderを使ったクエリ実行

Knexを利用してのクエリの構築や実行ができます。 \
またKnexのQueryBuilderに `execute()` メソッドを追加しており、これを利用すると同期的にクエリを実行することができます。

機能の詳細は以下のリンクを参照してください。 \
[Knex Query Builder | Knex.js](https://knexjs.org/guide/query-builder.html)

```ts
import { Model } from "accel-record";
import { User } from "./models/index.js";

// Model.connection.knex で Knex のインスタンスを取得できます。
const knex = Model.connection.knex;
const rows = knex
  .select("name", knex.raw("SUM(score) as total"))
  .from("Score")
  .groupBy("name")
  .execute();

console.log(rows);
// => [{ name: "John", total: "1" }, { name: "Alice", total: "2" }]

// queryBuiler プロパティを利用して、各モデルに対応するテーブルへのクエリを行うことができます。
const rows = User.queryBuilder.select("name").groupBy("name").execute();

console.log(rows); // => [{ name: "John" }, { name: "Alice" }]
```

## テスト

### Vitestを利用したテスト

Vitestを使ったテストでは、以下のようなsetupファイルを用意します。

```ts
// tests/vitest.setup.ts

import {
  DatabaseCleaner,
  Migration,
  initAccelRecord,
  stopWorker,
} from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import "../src/models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(async () => {
  await initAccelRecord({
    type: "mysql",
    // Vitestは通常マルチスレッドでてテストが行われます。
    // 各スレッドで異なるデータベースを利用するためには、VITEST_POOL_IDを利用してデータベースを分離します。
    datasourceUrl: `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`,
    // Prismaのスキーマファイルのディレクトリを指定します。
    // これは、テスト実行前にデータベースのマイグレーションを行うために必要な設定です。
    prismaDir: path.resolve(__dirname, "../prisma"),
  });
  // initAccelRecordでprismaDirを指定している場合、未反映のマイグレーションを実行することができます。
  await Migration.migrate();
});

// beforeEach, afterEachでDatabaseCleanerを利用し、各テスト毎にデータベースをクリーンアップします。
beforeEach(async () => {
  DatabaseCleaner.start();
});

afterEach(async () => {
  DatabaseCleaner.clean();
});

// テスト終了時に同期処理用のサブプロセスを停止するために、afterAllでstopWorkerを呼び出します。
afterAll(async () => {
  stopWorker();
});
```

Vitest設定ファイルのsetupFilesに上記のファイルを指定することで、テスト実行前にデータベースの初期化を行うことができます。  
詳細は[Vitestのドキュメント](https://vitest.dev/config/#setupfiles)を参照してください。

```js
// vitest.config.js

export default {
  test: {
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"], // ここに追加
    // ...
  },
  // ...
};
```

## 今後予定されている機能追加

- [accel-record-core] バリデーション
- [accel-record-core] スコープ
- [accel-record-core] Bulk Insert
- [accel-record-core] トランザクションのネスト
- [accel-record-core] PostgreSQLのサポート
- [accel-record-core] 複合IDの対応
- [accel-record-core] クエリインターフェースの拡充
- [accel-record-factory] trait
- [prisma-generator-accel-record] 各モデル用Factoryの生成

関連：[Accel Record Roadmap · Issue #1 · koyopro/accella](https://github.com/koyopro/accella/issues/1)
