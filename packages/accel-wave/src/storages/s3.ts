import type { PutObjectRequest } from "@aws-sdk/client-s3";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import type { Config } from "../index.js";
import { actions } from "../worker/index.js";
import { type Storage } from "./index.js";

declare module "../index.js" {
  interface Config {
    readonly s3:
      | Readonly<
          { region?: string; credentials?: AwsCredentialIdentity } & Partial<
            Omit<PutObjectRequest, "Body" | "Key">
          >
        >
      | undefined;
  }
}

export class S3Storage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    const { Bucket, ...putConfig } = this.requestConfig;
    actions.writeS3(
      this.s3ClientConfig,
      {
        ...putConfig,
        Bucket,
        Key: identifier,
        ContentType: file.type,
      },
      file
    );
  }

  retrive(identifier: string) {
    const byteArray = actions.loadS3(this.s3ClientConfig, {
      Bucket: this.s3Config.Bucket,
      Key: identifier,
    });
    return new File([new Blob([byteArray])], identifier);
  }

  delete(identifier: string) {
    actions.deleteS3(this.s3ClientConfig, {
      Bucket: this.s3Config.Bucket,
      Key: identifier,
    });
  }

  url(path: string) {
    const config = this.s3Config;

    if (config.ACL?.startsWith("public-read")) {
      return new URL(`https://${config.Bucket}.s3.${config.region}.amazonaws.com/${path}`);
    }

    const url = actions.getSignedS3Url(this.s3ClientConfig, {
      Bucket: config.Bucket,
      Key: path,
    });
    return new URL(url);
  }

  protected get s3Config() {
    const config = this.config.s3;
    if (!config) throw new Error("S3 config is not set");
    return config;
  }

  protected get s3ClientConfig() {
    const { region, credentials, ..._ } = this.s3Config;
    return { region, credentials };
  }

  protected get requestConfig() {
    const { region: _, credentials: __, ...requestConfig } = this.s3Config;
    return requestConfig;
  }
}
