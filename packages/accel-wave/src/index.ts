import type { Model } from "accel-record";
import { Config } from "./config.js";
import { type Storage } from "./storages/index.js";

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
  config: Config;
  storage: Storage;
  _file: File | undefined;
  model: Model | undefined;
  attr: string | undefined;

  constructor(options?: Partial<Config>) {
    this.config = new Config(options);
    this.storage = new this.config.storage(this.config);
  }

  get file() {
    if (this._file) return this._file;
    if (this.model && this.attr) {
      const identifier = (this.model as any)[this.attr];
      return (this._file = this.storage.retrive(identifier));
    }
  }

  set file(file: File | undefined) {
    this._file = file;
    this.config.filename = file?.name;
  }

  get filename() {
    return this.config.filename;
  }

  url() {
    if (!this.file) return undefined;
    if (this.config.assetHost) {
      return new URL(`${this.config.storeDir}/${this.filename}`, this.config.assetHost);
    } else {
      return new URL(
        `${this.config.root}/${this.config.storeDir}/${this.filename}`,
        import.meta.url
      );
    }
  }

  store(file: File) {
    this.file = file;
    this.storage.store(file);
  }
}
