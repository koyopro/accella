import type { Config } from "../config.js";
import { actions } from "../worker.js";
import { type Storage } from "./index.js";

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
}
