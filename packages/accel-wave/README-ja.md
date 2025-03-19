# Accel Wave

Accel Waveは、TypeScriptで書かれたファイルアップロードソリューションです。Accel Recordのモデルとファイルをシームレスに関連付け、ローカルファイルシステムまたはAmazon S3などのクラウドストレージにファイルを保存できます。インターフェースはCarrierWaveに影響を受けています。

## 機能

- ファイルシステムとAWS S3へのファイルアップロード
- モデルベースのファイル関連付け
- 設定のカスタマイズとオーバーライド
- 署名付きURLのサポート
- アップロード、ダウンロード、削除操作のサポート

## インストール

```bash
npm install accel-wave
```

## 基本的な使い方

### モデルとのマウント

Accel WaveをAccel Recordモデルと一緒に使用する基本的な例：

```typescript
// src/models/profile.ts
import { BaseUploader, mount } from "accel-wave";
import { ApplicationRecord } from "./applicationRecord";

export class ProfileModel extends ApplicationRecord {
  // avatarPathカラムにファイルパスが保存されます
  avatar = mount(this, "avatarPath", BaseUploader);
}
```

```ts
// 使用例
const profile = Profile.build({});
profile.avatar.file = new File(["avatar content"], "avatar.png", { type: "image/png" });
profile.save(); // ファイルが自動的に保存されます

// URLの取得
const avatarUrl = profile.avatar.url();

// ファイルの直接操作
profile.avatar.store(new File(["new content"], "new-avatar.png"));

// 削除
profile.avatar.store(null);
// または
profile.destroy(); // モデルの削除時に関連ファイルも削除
```

### カスタムアップローダー

独自のアップローダークラスを作成して動作をカスタマイズできます：

```typescript
import { BaseUploader } from "accel-wave";

class AvatarUploader extends BaseUploader {
  // 保存ディレクトリのカスタマイズ
  get storeDir() {
    return "avatars";
  }

  // ファイル名の変更
  get filename() {
    const originalName = super.filename;
    return `${Date.now()}_${originalName}`;
  }
}

// モデルで使用
export class ProfileModel extends ApplicationRecord {
  avatar = mount(this, "avatarPath", AvatarUploader);
}
```

### ストレージの設定

デフォルトでは、ファイルはローカルファイルシステムに保存されますが、S3も設定できます：

```typescript
import { configureAccelWave, S3Storage } from "accel-wave";

// グローバル設定
configureAccelWave({
  storage: S3Storage,
  storeDir: "uploads",
  s3: {
    region: "ap-northeast-1",
    Bucket: "my-bucket",
    ACL: "public-read",
    // 他のS3設定オプション...
  },
});

// または特定のアップローダーインスタンスで
const uploader = new BaseUploader({
  storage: S3Storage,
  s3: {
    region: "us-east-1",
    Bucket: "another-bucket",
  },
});
```

### アセットホストの設定

CDNやカスタムドメインを使用してファイルを提供したい場合は、`assetHost`オプションを設定できます：

```typescript
// グローバル設定で設定
configureAccelWave({
  assetHost: "https://assets.example.com",
});

// または特定のアップローダーインスタンスで
const uploader = new BaseUploader({
  assetHost: "https://cdn.example.com",
});

// 使用例
profile.avatar.url()?.href; // => https://assets.example.com/uploads/avatar.png
```

assetHostを設定すると、`url()`メソッドは指定されたホストを使用してURLを生成します。これは、S3などの他のストレージを使用している場合でも適用されます。これにより、CDNやカスタムドメインを使って効率的にファイルを配信できます。

### ファイルのダウンロード

URLからファイルをダウンロードして保存することもできます：

```typescript
const uploader = new BaseUploader();
uploader.download("https://example.com/image.jpg");
uploader.store();
```

## カスタムストレージの作成

独自のストレージクラスを作成するには、`Storage`インターフェースを実装します：

```typescript
import { Config, Storage } from "accel-wave";

export class CustomStorage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    // ファイル保存の実装
  }

  retrive(identifier: string): File {
    // ファイル取得の実装
  }

  delete(identifier: string) {
    // ファイル削除の実装
  }

  url(path: string): URL {
    // ファイルURLの生成
  }
}
```

各メソッドは同期APIである必要があります。S3Storageでは[sync-actions](https://www.npmjs.com/package/sync-actions)を利用して非同期処理を同期処理に変換しています。
