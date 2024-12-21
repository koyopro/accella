import type { Model } from "accel-record";
import { Config } from "./config.js";
import type { DeepPartial } from "./lib/deepMerge.js";
import { type Storage } from "./storages/index.js";

export { Config } from "./config.js";

export const mount = (model: Model, attr: string, uploader: BaseUploader) => {
  uploader.model = model;
  uploader.attr = attr;
  model.callbacks.before["save"].push(() => {
    if (uploader.filename) {
      (model as any)[attr] = uploader.filename;
    }
  });
  model.callbacks.after["save"].push(() => {
    if (uploader.file) {
      uploader.store(uploader.file);
    }
  });
  return uploader;
};

export class BaseUploader extends Config {
  model: Model | undefined;
  attr: string | undefined;
  protected _storage: Storage;
  protected _file: File | undefined;
  protected _filename: string | undefined;

  constructor(options?: DeepPartial<Config>) {
    super(options);
    this._storage = new this.storage(this);
  }

  get filename() {
    return this._filename;
  }
  set filename(value: string | undefined) {
    this._filename = value;
  }

  get file() {
    if (this._file) return this._file;
    if (this.model && this.attr) {
      const identifier = (this.model as any)[this.attr];
      return (this._file = this._storage.retrive(identifier));
    }
  }

  set file(file: File | undefined) {
    this._file = file;
    this._filename = file?.name;
  }

  url() {
    if (!this.filename) return undefined;

    const path = `${this.storeDir}/${this.filename}`;
    if (this.assetHost) {
      return new URL(path, this.assetHost);
    } else {
      return this._storage.url(path);
    }
  }

  store(file: File) {
    this.file = file;
    this._storage.store(file);
  }
}
