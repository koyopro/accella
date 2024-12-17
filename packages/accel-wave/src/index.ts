import { actions } from "./worker.js";

export class BaseUploader {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;

  constructor(options?: Partial<BaseUploader>) {
    Object.assign(this, options);
  }
}

export class FileStorage {
  constructor(public uploader: BaseUploader) {}

  store(file: File) {
    const filePath = new URL(
      `${this.uploader.root}/${this.uploader.storeDir}/${file.name}`,
      import.meta.url
    ).pathname;
    actions.writeFile(filePath, file);
  }
}
