import type { Config } from "../config.js";
import { actions } from "../worker.js";

export class S3Storage {
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
}
