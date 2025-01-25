Language: [English](README.md) | [日本語](README-ja.md)

# Accellaプロジェクト

Accellaは、豊富な機能と高い型安全性により高い開発効率を実現するためのフルスタックWebフレームワークです。スタートアップや小規模チームに特に適しています。

## インストール

```bash
npm create accella@latest
```

詳細は[こちら](./packages/accella/README-ja.md)をご覧ください。

## 特徴

- **サーバーファースト**
  - 従来からのフルスタックMVCフレームワークの流れを汲んでいます
  - Astroをベースとし、クライアントにはサーバーでレンダリング済みのHTMLを返します
  - アーキテクチャをシンプルに保ち、開発効率とユーザー体験を向上させます
- **ORMとの連携**
  - ORMとして、Active Recordパターンで実装されたAccel Recordを採用しています
  - フレームワークとORMの連携により、特にデータベースのCRUD操作を中心とした処理の開発効率を高めます
- **型安全**
  - テーブル操作からテンプレートレンダリングまで、TypeScriptによる型安全な開発環境を提供します

## 開発効率を高く保つための設計

- フルスタック
  - 一般的な機能は少ないコードでフレームワークの機能を呼び出すだけで実現し、独自の実装に集中できます
  - テーブルのCRUD操作、バリデーション、セッション管理、パスワード認証、高度な検索、フォームの構築、リクエストパラメータのパース処理、ページング、多言語対応、セキュリティなど
  - プロジェクト開始時のライブラリ選定に時間をかける必要もありません
- 型による迅速なフィードバック
  - TypeScriptの型安全性によりデバッグやリファクタリングの効率を高く保てます
  - データベースとの連携部分はもちろん、Astroコンポーネントを利用することで他のサーバーサイドフレームワークにはない型安全なテンプレートレンダリングも提供します
- シンプルなアーキテクチャ
  - バックエンド中心の作りになっており、SPAのようにサーバーサイドAPIとフロントエンドアプリケーションを別々に開発する必要はありません
  - SSRのためのサーバーをAPI用のサーバーと別に用意する必要もなく、インフラアーキテクチャをシンプルに保てます
- フロントエンドフレームワークとの連携
  - ブラウザへはレンダリング済みのHTMLを返すのが基本ですが、Astroの機能により柔軟に(React, Vue, Svelte等の)フロントエンドフレームワークを組み込み、連携することができます

## 使用技術

- [Astro](https://astro.build/)
  - ルーティングとレンダリングなどフレームワークのベース
- [Accel Record](./packages/accel-record/README.md)
  - Active Recordパターンを採用した高度なORマッピング
- [Prisma](https://www.prisma.io/)
  - テーブル定義とマイグレーション

## このリポジトリに含まれるライブラリ

- [Accella](./packages/accella/)
  - AstroとAccel Recordで構築されたWebフレームワーク
- [Accel Record](./packages/accel-record/)
  - TypeScript用の型安全で同期的なORM。Active Recordパターンを採用し、Ruby on RailsのActive Recordに強く影響を受けています
- [Accel Record Factory](./packages/accel-record-factory/)
  - Accel Recordモデルを作成するためのファクトリ
- [Accel Web](./packages/accel-web/)
  - AstroとAccel Recordを統合するためのライブラリ
