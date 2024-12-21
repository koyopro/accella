import type { Config } from "../index.js";
import { actions } from "../worker.js";
import { type Storage } from "./index.js";

declare module "../index.js" {
  interface Config {
    s3:
      | {
          region?: string;
          bucket?: string;
        }
      | undefined;
  }
}

export class S3Storage implements Storage {
  constructor(public config: Config) {}

  store(file: File) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");
    actions.writeS3(
      { region: config.region },
      {
        Bucket: config.bucket,
        Key: file.name,
        ContentType: file.type,
      },
      file
    );
  }

  retrive(identifier: string) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");

    const byteArray = actions.loadS3(
      { region: config.region },
      {
        Bucket: config.bucket,
        Key: identifier,
      }
    );
    return new File([new Blob([byteArray])], identifier);
  }

  url(identifier: string) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");

    const url = actions.getSignedS3Url(
      { region: config.region },
      {
        Bucket: config.bucket,
        Key: identifier,
      }
    );
    return new URL(url);
  }
}
