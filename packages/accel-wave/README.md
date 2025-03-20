# Accel Wave

Accel Wave is a file upload solution written in TypeScript. It seamlessly integrates files with Accel Record models and allows you to store files on the local filesystem or cloud storage services like Amazon S3. The interface is inspired by CarrierWave.

## Features

- File uploads to filesystem and AWS S3
- Model-based file associations
- Customizable configuration and overrides
- Support for signed URLs
- Upload, download, and delete operations

## Installation

```bash
npm install accel-wave
```

## Basic Usage

### Mounting to Models

Here's a basic example of using Accel Wave with an Accel Record model:

```typescript
// src/models/profile.ts
import { BaseUploader, mount } from "accel-wave";
import { ApplicationRecord } from "./applicationRecord";

export class ProfileModel extends ApplicationRecord {
  // The file path will be stored in the avatarPath column
  avatar = mount(this, "avatarPath", BaseUploader);
}
```

```ts
// Usage example
const profile = Profile.build({});
profile.avatar.file = new File(["avatar content"], "avatar.png", { type: "image/png" });
profile.save(); // The file is automatically saved

// Getting the URL
const avatarUrl = profile.avatar.url();

// Direct file operations
profile.avatar.store(new File(["new content"], "new-avatar.png"));

// Deletion
profile.avatar.store(null);
// Or
profile.destroy(); // Related files are also deleted when the model is destroyed
```

### Custom Uploaders

You can create your own uploader class to customize behavior:

```typescript
import { BaseUploader } from "accel-wave";

class AvatarUploader extends BaseUploader {
  // Customize the storage directory
  get storeDir() {
    return "avatars";
  }

  // Change the filename
  get filename() {
    const originalName = super.filename;
    return `${Date.now()}_${originalName}`;
  }
}

// Use in the model
export class ProfileModel extends ApplicationRecord {
  avatar = mount(this, "avatarPath", AvatarUploader);
}
```

### Storage Configuration

By default, files are stored on the local filesystem, but you can also configure S3:

```typescript
import { configureAccelWave, S3Storage } from "accel-wave";

// Global configuration
configureAccelWave({
  storage: S3Storage,
  storeDir: "uploads",
  s3: {
    region: "ap-northeast-1",
    Bucket: "my-bucket",
    ACL: "public-read",
    // Other S3 configuration options...
  },
});

// Or for a specific uploader instance
const uploader = new BaseUploader({
  storage: S3Storage,
  s3: {
    region: "us-east-1",
    Bucket: "another-bucket",
  },
});
```

### Asset Host Configuration

If you want to serve files using a CDN or custom domain, you can set the `assetHost` option:

```typescript
// Set in the global configuration
configureAccelWave({
  assetHost: "https://assets.example.com",
});

// Or for a specific uploader instance
const uploader = new BaseUploader({
  assetHost: "https://cdn.example.com",
});

// Usage example
profile.avatar.url()?.href; // => https://assets.example.com/uploads/avatar.png
```

When assetHost is set, the `url()` method will generate URLs using the specified host. This applies even when using other storage options like S3. This allows for efficient file delivery via CDNs or custom domains.

### Downloading Files

You can also download files from URLs and save them:

```typescript
const uploader = new BaseUploader();
uploader.download("https://example.com/image.jpg");
uploader.store();
```

## Creating Custom Storage

To create your own storage class, implement the `Storage` interface:

```typescript
import { Config, Storage } from "accel-wave";

export class CustomStorage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    // Implement file storage
  }

  retrive(identifier: string): File {
    // Implement file retrieval
  }

  delete(identifier: string) {
    // Implement file deletion
  }

  url(path: string): URL {
    // Generate file URL
  }
}
```

All methods must use synchronous APIs. S3Storage uses [sync-actions](https://www.npmjs.com/package/sync-actions) to convert asynchronous operations to synchronous ones.
