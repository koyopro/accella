import type { Model } from "accel-record";
import { Config, type ConfigOptions } from "./config.js";
import { type Storage } from "./storages/index.js";

export { Config } from "./config.js";
export { worker } from "./worker.js";

export const mount = (model: Model, attr: string, uploader: BaseUploader) => {
  uploader.model = model;
  uploader.attr = attr;
  model.callbacks.before["save"].push(() => {
    if (uploader.filename) {
      (model as any)[attr] = uploader.filename;
    }
  });
  model.callbacks.after["save"].push(() => uploader.store());
  return uploader;
};

export class Item {
  constructor(
    public identifier: string,
    public file: File
  ) {}
}

export class BaseUploader extends Config {
  model: Model | undefined;
  attr: string | undefined;
  protected hasUpdate: boolean = false;
  protected _storage: Storage;
  protected _filename: string | undefined;
  protected item: Item | undefined;
  protected removedItems: Item[] = [];

  constructor(options?: ConfigOptions) {
    super(options);
    this._storage = new this.storage(this);
  }

  get filename() {
    return this._filename ?? "";
  }

  get file() {
    if (this.item?.file) return this.item.file;
    if (this.model && this.attr) {
      const identifier = (this.model as any)[this.attr];
      const path = this.pathFor(identifier);
      this._filename = identifier;
      this.item = new Item(this.filename, this._storage.retrive(path));
      return this.item.file;
    }
  }

  set file(file: File | undefined) {
    if (this.item) this.removedItems.push(this.item);
    this._filename = file?.name;
    this.item = file ? new Item(this.filename, file) : undefined;
    this.hasUpdate = true;
  }

  url() {
    if (!this.item) return undefined;

    if (this.assetHost) {
      return new URL(this.path, this.assetHost);
    } else {
      return this._storage.url(this.path);
    }
  }

  store(file?: File | undefined | null) {
    if (file) this.file = file;
    if (file === null) this.file = undefined;
    if (this.hasUpdate && this.item) {
      this._storage.store(this.item.file, this.path);
      this.hasUpdate = false;
    }
    for (const item of this.removedItems) {
      this._storage.delete(this.pathFor(item.identifier));
    }
    this.removedItems = [];
  }

  protected get path() {
    return this.pathFor(this.item?.identifier ?? "");
  }

  protected pathFor(identifier: string) {
    return `${this.storeDir}/${identifier}`;
  }
}
