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
    public identifier: string | undefined,
    public file: File
  ) {}
}

export class BaseUploader extends Config {
  model: Model | undefined;
  attr: string | undefined;
  protected hasUpdate: boolean = false;
  protected _storage: Storage;
  protected item: Item | undefined;
  protected removedItems: Item[] = [];

  constructor(options?: ConfigOptions) {
    super(options);
    this._storage = new this.storage(this);
  }

  get filename() {
    return this.item?.identifier;
  }
  set filename(value: string | undefined) {
    if (this.item) this.item.identifier = value;
  }

  get file() {
    if (this.item?.file) return this.item.file;
    if (this.model && this.attr) {
      const identifier = (this.model as any)[this.attr];
      const path = `${this.storeDir}/${identifier}`;
      this.item = new Item(identifier, this._storage.retrive(path));
      return this.item.file;
    }
  }

  set file(file: File | undefined) {
    if (this.item) this.removedItems.push(this.item);
    this.item = file ? new Item(file.name, file) : undefined;
    this.hasUpdate = true;
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

  store(file?: File | undefined | null) {
    if (file) this.file = file;
    if (file === null) this.file = undefined;
    if (this.hasUpdate && this.item?.file && this.filename) {
      const path = `${this.storeDir}/${this.filename}`;
      this._storage.store(this.item.file, path);
      this.hasUpdate = false;
    }
    for (const item of this.removedItems) {
      const path = `${this.storeDir}/${item.identifier}`;
      this._storage.delete(path);
    }
    this.removedItems = [];
  }
}
