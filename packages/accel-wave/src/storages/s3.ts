import type { PutObjectRequest } from "@aws-sdk/client-s3";
import type { Config } from "../index.js";
import { actions } from "../worker.js";
import { type Storage } from "./index.js";

declare module "../index.js" {
  interface Config {
    s3: ({ region?: string } & Omit<PutObjectRequest, "Body" | "Key">) | undefined;
  }
}

export class S3Storage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");
    const { region, ...putConfig } = config;
    actions.writeS3(
      { region: region },
      {
        ...putConfig,
        Bucket: config.Bucket,
        Key: identifier,
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
        Bucket: config.Bucket,
        Key: identifier,
      }
    );
    return new File([new Blob([byteArray])], identifier);
  }

  delete(identifier: string) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");

    actions.deleteS3(
      { region: config.region },
      {
        Bucket: config.Bucket,
        Key: identifier,
      }
    );
  }

  url(path: string) {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");

    if (config.ACL?.startsWith("public-read")) {
      return new URL(`https://${config.Bucket}.s3.${config.region}.amazonaws.com/${path}`);
    }

    const url = actions.getSignedS3Url(
      { region: config.region },
      {
        Bucket: config.Bucket,
        Key: path,
      }
    );
    return new URL(url);
  }
}
