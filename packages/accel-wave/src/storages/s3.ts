import type { BaseUploader } from "../index.js";
import { actions } from "../worker.js";

export class S3Storage {
  constructor(public uploader: BaseUploader) {}

  store(file: File) {
    const config = this.uploader.s3;
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
