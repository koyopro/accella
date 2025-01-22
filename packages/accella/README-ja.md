Language: [English](https://github.com/koyopro/accella/blob/main/packages/accella/README.md) | [日本語](https://github.com/koyopro/accella/blob/main/packages/accella/README-ja.md)

# Accella

A web framework built with Astro and Accel Record.

## Installation

```bash
npm create accella@latest my-accella-app
```

## Getting Started

```bash
cd my-accella-app
npm run dev
open http://localhost:4321
```

## 構成

### Astro

Accellaは、WebフレームワークのAstroをベースに構築されています。AstroはServer-Firstなフレームワークで、ReactやVue.jsのようなフロントエンドコンポーネントと柔軟に連携することができます。

ページのルーティングは`src/pages`ディレクトリに配置されたAstroファイルによって行われます。Astroファイルは`.astro`拡張子を持ち、HTMLとJavaScriptを1つのファイルに記述することができます。

https://docs.astro.build/ja/getting-started/

### Accel Record

Accel Recordは、型安全で同期的な、TypeScript用のORMです。Active Recordパターンを採用しており、インターフェースはRuby on RailsのActiveRecordに強く影響を受けています。

Accellaでは最初からAccel Recordが組み込まれているため、すぐにデータベースを使った開発を始めることができます。初期設定ではSQLiteが使われていますが、設定を変更することでMySQLやPostgreSQLも利用可能です。

Accel Recordではマイグレーション管理にPrismaを利用しており、`db/schema/main.prisma` にデータベース設定やモデルの定義を記述します。

https://github.com/koyopro/accella/blob/main/packages/accel-record/README.md

### Accel Web

Accel Webは、AstroによるWebアプリケーション開発をサポートするライブラリで、こちらもAccellaに組み込まれています。セッション管理、リクエストパラメータのパース、フォーム作成などの機能を提供します。

https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md

#### Request Parameters

Accellaではリクエストパラメータを扱うためのRequest ParametersオブジェクトをAstro.locals.paramsで提供します。

Request Parametersの利用方法は[Accel WebのREADME](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#form-and-request-parameters)を参照してください。

#### Session

Accellaではセッション管理用オブジェクトをAstro.locals.sessionで提供します。

```astro
---
import { User } from '../models';

if (Astro.request.method === 'POST') {
  Astro.locals.session.user = User.findBy({ email: 'test@example.com' });
}
const currentUser: User | undefined = Astro.locals.session.user;
---
{currentUser ? <p>Hello, {currentUser.name}!</p> : <p>Hello, Guest!</p>}
```

デフォルトではセッションから取り出した値はany型ですが、`src/config/session.ts`の型定義を変更することで型安全に利用することができます。

```typescript
import { type Session as BaseSession } from "accella/session";
import { User } from "../models";

// You can define the type of the session object here
export type SessionData = {
  user: User; // Add here
};

export type Session = BaseSession & Partial<SessionData>;
```

#### CSRF対策

AccellaではCSRF対策が適用されており、POST等のリクエストを送信する際には適切なトークンをリクエストに含めない場合、InvalidAuthenticityTokenエラーが発生します。
[関連の機能を利用してフォームを用意する場合](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#form-and-request-parameters)には自動的にCSRFトークンが生成され、リクエストに含まれるようになります。
その他の方法でGET以外のリクエストを送信する場合に必要な対応については、[CSRF Protection](https://github.com/koyopro/accella/blob/main/packages/accel-web/README.md#csrf-protection)の内容を参照してください。
