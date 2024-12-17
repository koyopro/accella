import { actions } from "./worker.js";

export class BaseUploader {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;

  constructor(options?: Partial<BaseUploader>) {
    Object.assign(this, options);
  }

  get filename(): string | undefined {
    return undefined;
  }
}

export class FileStorage {
  constructor(public uploader: BaseUploader) {}

  store(file: File) {
    const filename = this.uploader.filename ?? file.name;
    const filePath = new URL(
      `${this.uploader.root}/${this.uploader.storeDir}/${filename}`,
      import.meta.url
    ).pathname;
    actions.writeFile(filePath, file);
  }
}
