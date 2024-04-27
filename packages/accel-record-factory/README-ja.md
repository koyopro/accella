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

テストファイルでファクトリーを使用することができます。

```ts
// tests/user.test.ts

import { $User } from "./factories/user";

test("UserFactory", () => {
  const newUser = $User.build();

  const user = $User.create({
    firstName: "John",
    lastName: "Doe",
    age: 20,
  });
});
```

## 使い方

### デフォルト値の設定

### 連番の利用

### 関連の生成

### Traits
