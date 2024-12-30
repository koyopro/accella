Language: [English](https://github.com/koyopro/accella/blob/main/packages/accel-record/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accel-record/README-ja.md)

# Accel Record

Accel Recordは、型安全で同期的な、TypeScript用のORMです。 \
Active Recordパターンを採用しており、インターフェースはRuby on RailsのActiveRecordに強く影響を受けています。

スキーマ管理とマイグレーションにはPrismaを利用しており、既存のPrismaスキーマをそのまま利用することもできます。

MySQL, PostgreSQL, SQLiteでの利用が可能です。

## 特徴

- ActiveRecordパターン
- 型安全なクラス
- Native ESM
- 同期的なAPI
- MySQL, PostgreSQL, SQLiteのサポート

## 目次

- [利用例](#利用例)
- [Installation](#installation)
- [Quick Start](#quick-Start)
- [Examples](#examples)
- [モデルの型](#モデルの型)
- [Prismaスキーマとフィールドの型](#prismaスキーマとフィールドの型)
- [Jsonフィールドの型](#jsonフィールドの型)
- [関連付け](#関連付け)
- [クエリインターフェース](#クエリインターフェース)
- [スコープ](#スコープ)
- [Flexible Search](#flexible-search)
- [テスト](#テスト)
- [バリデーション](#バリデーション)
- [コールバック](#コールバック)
- [Serialization](#serialization)
- [Bulk Insert](#bulk-Insert)
- [トランザクション](#トランザクション)
- [ロック](#ロック)
- [国際化(I18n)](#国際化i18n)
- [パスワード認証](#パスワード認証)
- [Formオブジェクト](#formオブジェクト)
- [Nullableな値の扱いについて](#nullableな値の扱いについて)
- [今後予定されている機能追加](#今後予定されている機能追加)

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

   - for **PostgreSQL**

     ```
     npm install pg
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
| Multi-field ID (Composite ID)   | @@id        | ✅       |
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

## スコープ

再利用可能なクエリの内容をスコープとして定義できます。

スコープを定義するには、モデルにstaticなクラスメソッドを用意し、 `@scope` デコレータを付けます。
その後 `prisma generate` を実行することで、スコープがクエリインターフェースに反映されます。

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

上のような定義で、以下のようにスコープを利用することができます。

```ts
import { User } from "./models/index.js";

// name が John で、 age が 20以上 のユーザー数を取得
User.johns().adults().count(); // => 1
```

## Flexible Search

`.search()`メソッドを使うと、オブジェクトベースの柔軟な検索が可能です。
(インターフェースは Ransack gem を参考にしています)

検索パラメータは、フィールド名と検索条件を組み合わせた文字列をキー、検索用の値をバリューとして持つオブジェクトで指定します。
キーには関連付けを含めることができます。
検索条件には、`eq`, `cont`, `matches`, `lt`, `gte`, `in`, `null` などが利用可能です。
その他に `not`, `or`, `and`, `any`, `all` などの修飾子も用意されています。
詳細はsearch()メソッドのドキュメントを参照してください。

```ts
import { User } from "./models/index.js";

const search = User.search({
  name_eq: "John", // name が "John" に等しい
  age_not_null: 1, // age が null でない
  profile_bio_cont: "foo", // 関連である profile の bio が "foo" を含む
  email_or_name_cont_any: ["bar", "baz"], // email または name が "bar" または "baz" を含む
});
const users = search.result();
```

また、検索パラメータのキーには`searchableScopes`配列で定義された検索可能なスコープの名前を含めることができます。

例えば以下のように定義された`bio_cont`スコープは検索パラメータで使用することができます。

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

const search = User.search({ bio_cont: "foo" }); // profile の bio が "foo" を含む
const users = search.result();
```

## テスト

### Vitestを利用したテスト

Vitestを使ったテストでは、以下のようなsetupファイルを用意します。

```ts
// tests/vitest.setup.ts

import { DatabaseCleaner, Migration, initAccelRecord, stopWorker } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import { getDatabaseConfig } from "../src/models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(async () => {
  await initAccelRecord({
    ...getDatabaseConfig(), // schema.prismaファイルに基づいてtypeとprismaDirが自動的に設定されます。

    // Vitestは通常マルチスレッドでテストが行われます。
    // 各スレッドで異なるデータベースを利用するためには、VITEST_POOL_IDを利用してデータベースを分離します。
    datasourceUrl: `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`,
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

### モデルのFactory

テスト用のレコードを生成するために、Factoryを利用することができます。  
詳細は[accel-record-factory](https://github.com/koyopro/accella/blob/main/packages/accel-record-factory/README-ja.md)を参照してください。

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

## バリデーション

### バリデーションのサンプル

モデルに対するバリデーションのサンプルを記載します。

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

### バリデーションの実行タイミング

save, update, craeteメソッドを利用する場合、バリデーションが自動的に実行され、エラーが無い場合のみ保存処理が行われます。

```ts
import { User } from "./models/index.js";

// バリデーションエラーが発生した場合、saveやupdateはfalseを返します。
const newUser = User.build({ firstName: "" });
newUser.save(); // => false
newUser.errors.fullMessages(); // => ["FirstName can't be blank"]

const user = User.first()!;
user.update({ firstName: "" }); // => false
newUser.errors.fullMessages(); // => ["FirstName can't be blank"]

// バリデーションエラーが発生した場合、createでは例外がスローされます。
User.create({ firstName: "" }); // => Error: Failed to create
```

### バリデーションの定義

`validates()`関数を利用しモデルクラスに`validations`プロパティを用意することで、バリデーションを定義することができます。
または、BaseModelの`validateAttributes()`メソッドをオーバーライドする方法もあります。

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
    // よく使われるバリデーションは、バリデーションヘルパーを利用して簡単に記述ができます。
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

    // カスタムバリデータの利用例
    MyValidator,
  ]);

  // validateAttributesメソッドをオーバーライドして、バリデーションを定義することもできます。
  override validateAttributes() {
    this.validates("key", { uniqueness: true });

    // 独自のロジックでバリデーションを行う場合は、 errros.add メソッドを利用してエラーメッセージを追加します。
    if (this.key && !/^[a-z]$/.test(this.key[0])) {
      this.errors.add("key", "should start with a lowercase letter");
    }
  }
}

// カスタムバリデータは、Validatorを継承してvalidateメソッドを実装します。
class MyValidator extends Validator<{ key: string | undefined }> {
  validate() {
    if (this.record.key === "xs") {
      this.errors.add("key", "should not be xs");
    }
  }
}
```

## コールバック

`before`, `after` デコレータを利用してモデルにコールバックを定義することで、バリデーションや保存の前後に処理を挟むことができます。
コールバックの対象は `validation`, `save`, `create`, `update`, `destroy` となります。
(TypeScript 5.0 で実装された Stage 3 のデコレータが動作する環境で利用できます)

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

`toHash`メソッドや`toHashArray`メソッドを利用することで、モデルのデータをプレーンなオブジェクトに変換することができます。

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

`toJson`メソッドを利用することで、モデルのデータをJSON文字列に変換することができます。

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

Bulk Insertは、一度に複数のレコードをデータベースに挿入する機能です。 \
Accel Recordでは、`import()` メソッドを利用してBulk Insertを行うことができます。

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

## トランザクション

`Model.transaction()` メソッドでトランザクションを利用できます。`Rollback` を例外として投げることでトランザクションをロールバックすることができ、トランザクションはネストすることができます。

```ts
import { Rollback } from "accel-record";
import { User } from "./models/index.js";

User.transaction(() => {
  User.create({});
  console.log(User.count()); // => 1

  User.transaction(() => {
    User.create({});
    console.log(User.count()); // => 2

    // Rollback の throw により内側のトランザクションはロールバックされます
    throw new Rollback();
  });
  // 外側のトランザクションはコミットされます
});
console.log(User.count()); // => 1
```

## ロック

`lock()`や`withLock()`メソッドを利用することで行のロックを行うことができます。(MySQLとPostgreSQLに対応)

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

## 国際化(I18n)

[`i18next`](https://www.i18next.com) を利用した国際化機能を提供しています。

`Model.model_name.human`メソッドと`Model.human_attribute_name(attribute)`メソッドを使うことで、モデル名と属性名の翻訳を参照できます。

```ts
import i18next from "i18next";
import { User } from "./models/index.js";

i18next
  .init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          "accelrecord.models.User": "ユーザー",
          "accelrecord.attributes.User.firstName": "名",
          "accelrecord.attributes.User.lastName": "姓",
        },
      },
    },
  })
  .then(() => {
    console.log(User.modelName.human); // => "ユーザー"
    console.log(User.humanAttributeName("firstName")); // => "名"
  });
```

### エラーメッセージの翻訳

バリデーションエラーメッセージも翻訳に対応しており、以下からエラーメッセージを参照します。

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

上のUserModelの例では、`'blank'`というメッセージキーの翻訳がエラーメッセージに利用されます。

この例では、以下のキーを順に探し、最初に見つかったキーが利用されます。

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
    lng: "ja",
    resources: {
      ja: {
        translation: {
          "accelrecord.models.User": "ユーザー",
          "accelrecord.attributes.User.firstName": "名",
          "accelrecord.attributes.User.lastName": "姓",
          "accelrecord.errors.messages.blank": "を入力してください", // 追加
        },
      },
    },
  })
  .then(() => {
    const user = User.build({});
    user.validate();
    console.log(User.errors.fullMessages);
    // => ["名 を入力してください"]
  });
```

各バリデーションに対応するメッセージキーは以下の通りです。

| バリデーション | オプション | メッセージキー | 式展開 |
| -------------- | ---------- | -------------- | ------ |
| acceptance     | -          | 'accepted'     | -      |
| presence       | -          | 'blank'        | -      |
| length         | 'minimum'  | 'tooShort'     | count  |
| length         | 'maximum'  | 'tooLong'      | count  |
| uniqueness     | -          | 'taken'        | -      |
| format         | -          | 'invalid'      | -      |
| inclusion      | -          | 'inclusion'    | -      |
| numericality   | 'equalTo'  | 'equalTo'      | count  |

式展開が `count` になっているものは、エラーメッセージに `{{count}}` を含むときにその部分がオプションで指定された値に置き換えられます。

### Enumの翻訳

Enumの各値に対しても翻訳を定義することができます。

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

`User.role.options()`で、Enumの各値に対応する翻訳を取得することができます。
各`User`が持つ`role`に対して、`roleText`というプロパティでEnumの値に対応する翻訳を取得することができます。

```ts
import i18next from "i18next";
import { User } from "./models/index.js";

i18next
  .init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          "enums.User.Role.MEMBER": "メンバー",
          "enums.User.Role.ADMIN": "管理者",
        },
      },
    },
  })
  .then(() => {
    User.role.options(); // => [["メンバー", "MEMBER"], ["管理者", "ADMIN"]]

    const user = User.build({});
    user.role; // => "MEMBER"
    user.roleText; // => "メンバー"
  });
```

`user.role`の例では、以下のキーを順に探し、最初に見つかったキーが利用されます。

```
enums.User.Role.MEMBER
enums.defaults.Role.MEMBER
enums.Role.MEMBER
```

## パスワード認証

Bcryptを利用してセキュアにハッシュ化したパスワードを保持し、それを用いて認証するための仕組みを提供しています。

まずモデルにハッシュ化されたパスワードを保持するため`passwordDigest`フィールドを追加します。

```ts
// prisma/schema.prisma
model User {
  ...
  passwordDigest String // パスワードのハッシュ値を保持する
}
```

次に`hasSecurePassword()`を利用してパスワードのハッシュ化と認証を行うための機能をモデルに対して追加します。

```ts
// ./models/user.ts
import { hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends Mix(ApplicationRecord, hasSecurePassword()) {}
```

これで`password`や`passwordConfirmation`フィールドを利用してパスワードのバリデーションとハッシュ化を、`authenticate()`メソッドを利用してパスワードの認証を行うことができます。

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

パスワード保持用のフィールド名を`passwordDigest`以外に設定したり、複数のパスワードをモデルで管理することもできます。

```ts
// ./models/user.ts
import { hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends Mix(
  ApplicationRecord,
  hasSecurePassword(), // passwordDigest フィールドを利用
  hasSecurePassword({ attribute: "recovery", validation: false }) // recoveryDigest フィールドを利用
) {}
```

## Formオブジェクト

Formオブジェクトは、通常のモデルとは切り分けてバリデーションや保存処理などを行えるデザインパターンです。複数のモデルにまたがる処理や、通常のモデルと対応しないようなフォームの処理を行うために利用されます。
`FormModel` クラスを継承することで、テーブルとは無関係なクラスでありながら通常のモデルと同様にattributeを持たせた上でバリデーションも行うことができます。

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

    // バリデーションが成功した場合の処理
    // 各値をモデルに保存するなど
    // ...
    return true;
  }
}
```

```ts
// フォームの入力値を受け取る
const myFormParams = { title: "Task", priority: "2", dueDate: "2022-12-31" };
const form = MyForm.build(myFormParams);
if (form.save()) {
  // 保存成功時の処理
  /* ... */
} else {
  // 保存失敗時の処理
  const errorMessages = form.errors.fullMessages();
  // エラーメッセージを表示するなど
  /* ... */
}
```

## Nullableな値の扱いについて

Nullableな値について、TypeScriptではJavaScriptと同様にundefinedとnullの2つが存在します。 \
Accel Recordに関してはnullを利用する必要は無く、Nullableな値の表現はundefinedに統一して扱えるように設計しています。
これは主にnullとundefinedの混在による複雑さを避けるためです。 \
undefinedとnullを使い分けるメリットもあるとは理解しますが、それよりも型の複雑さを避けることでコードの可読性や保守性が保たれることを重視しています。

```ts
import { User } from "./models/index.js";

// オプショナルなフィールドのデフォルト値はundefinedとなります。
const newUser = User.build({});
newUser.age; // => undefined

// DB上でnullを持つレコードの検索にも、undefinedを指定することができます。
const user = User.findBy({ age: undefined })!;

// DB上でnullの値を持つフィールドはundefinedとして扱われます。
user.age; // => undefined

// オプショナルなフィールドにundefinedを指定することで、DB上の値をnullで更新することができます。
user.update({ age: undefined });
```

## 今後予定されている機能追加

[Accel Record Roadmap](https://github.com/koyopro/accella/issues/1)

## 設計と開発の背景

Accel Recordの設計や開発の動機などに関する記事を紹介します。

- [Active Recordパターンを採用したTypeScript用ORM「Accel Record」の紹介](https://qiita.com/koyopro/items/917c2c98db3de7518849)
- [TypeScriptで書ける型安全なRuby on Railsを求め、ORMの開発を始めた](https://qiita.com/koyopro/items/748ddd27aa32ff14c95f)
- [TypeScriptの新しいORMに同期APIを採用した理由](https://qiita.com/koyopro/items/b11be652ee95426f244e)
- [サーバーサイドTypeScriptでも、非同期処理を使わないという選択肢が必要なのではないか](https://qiita.com/koyopro/items/2724c764181cbc60b236)
