import { actions } from "./worker.js";

export class BaseUploader {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;
  storege = new FileStorage(this);
  file: File | undefined;
  assetHost: string | undefined;

  constructor(options?: Partial<BaseUploader>) {
    Object.assign(this, options);
  }

  get filename(): string | undefined {
    return this.file?.name;
  }

  url() {
    if (!this.file) return undefined;
    if (this.assetHost) {
      return new URL(`${this.storeDir}/${this.filename}`, this.assetHost);
    } else {
      return new URL(`${this.root}/${this.storeDir}/${this.filename}`, import.meta.url);
    }
  }

  store(file: File) {
    this.file = file;
    this.storege.store(file);
  }
}

export class FileStorage {
  constructor(public uploader: BaseUploader) {}

  store(file: File) {
    const filePath = new URL(
      `${this.uploader.root}/${this.uploader.storeDir}/${this.uploader.filename}`,
      import.meta.url
    ).pathname;
    actions.writeFile(filePath, file);
  }
}
