import type { Model } from "accel-record";
import type { ConfigOptions } from "./config.js";
import { Config } from "./index.js";
import type { Storage } from "./storages/index.js";

export class Item {
  constructor(
    public readonly identifier: string,
    public readonly file: File
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
    if (this.item) return this.item.file;
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
    const filename = this.filename;
    this.item = file ? new Item(filename, file) : undefined;
    if (this.model && this.attr) (this.model as any)[this.attr] = filename;

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
    }
    this.hasUpdate = false;
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
