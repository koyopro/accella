import type { Model } from "accel-record";
import fs from "fs";
import { actions } from "./worker.js";

export const mount = (model: Model, attr: string, uploader: BaseUploader) => {
  uploader.model = model;
  uploader.attr = attr;
  model.callbacks.before["save"].push(() => {
    if (uploader.file) {
      uploader.store(uploader.file);
      (model as any)[attr] = uploader.filename;
    }
  });
  return uploader;
};

export class BaseUploader {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;
  storege = new FileStorage(this);
  _file: File | undefined;
  assetHost: string | undefined;
  model: Model | undefined;
  attr: string | undefined;

  constructor(options?: Partial<BaseUploader>) {
    Object.assign(this, options);
  }

  get file() {
    if (this._file) return this._file;
    if (this.model && this.attr) {
      const identifier = (this.model as any)[this.attr];
      return (this._file = this.storege.retrive(identifier));
    }
  }

  set file(file: File | undefined) {
    this._file = file;
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

  retrive(identifier: string) {
    const filePath = new URL(
      `${this.uploader.root}/${this.uploader.storeDir}/${identifier}`,
      import.meta.url
    ).pathname;
    return new File([fs.readFileSync(filePath)], identifier);
  }
}
