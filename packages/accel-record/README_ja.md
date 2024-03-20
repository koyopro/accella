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
