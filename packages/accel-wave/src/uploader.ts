import type { Model } from "accel-record";
import type { ConfigOptions } from "./config.js";
import { Config } from "./index.js";
import type { Storage } from "./storages/index.js";
import { actions } from "./worker/index.js";

export class Item {
  constructor(
    public readonly identifier: string,
    public readonly file: File
  ) {}
}

/**
 * The `BaseUploader` class provides functionality for managing file uploads.
 * It extends the `Config` class and includes methods for storing, retrieving,
 * and deleting files, as well as generating URLs for uploaded files.
 *
 * @extends Config
 */
export class BaseUploader extends Config {
  model: Model | undefined;
  attr: string | undefined;
  protected hasUpdate: boolean = false;
  protected _storage: Storage;
  protected _filename: string | undefined;
  protected _item: Item | undefined;
  protected removedItems: Item[] = [];

  constructor(options?: ConfigOptions) {
    super(options);
    this._storage = new this.storage(this);
  }

  get filename() {
    return this._filename ?? "";
  }

  get file() {
    return this.item?.file;
  }

  protected itemByModel() {
    if (!this.model || !this.attr) return undefined;

    const identifier = (this.model as any)[this.attr];
    if (!identifier) return undefined;

    const path = this.pathFor(identifier);
    this._filename = identifier;
    return new Item(this.filename, this._storage.retrive(path));
  }

  get item() {
    return (this._item ||= this.itemByModel());
  }

  set file(file: File | undefined) {
    if (this.item) this.removedItems.push(this.item);
    this._filename = file?.name;
    const filename = this.filename;
    this._item = file ? new Item(filename, file) : undefined;
    if (this.model && this.attr) (this.model as any)[this.attr] = filename;

    this.hasUpdate = true;
  }

  /**
   * Returns the URL of the uploaded file.
   * If assetHost is defined, it constructs the URL using assetHost.
   * Otherwise, it uses the storage's URL method.
   */
  url() {
    if (!this.item) return undefined;

    if (this.assetHost) {
      return new URL(this.path, this.assetHost);
    } else {
      return this._storage.url(this.path);
    }
  }

  /**
   * Stores the provided file. If no file is provided, it uses the existing file.
   * If the file is null, it removes the current file.
   * It also handles the removal of previously stored files.
   */
  store(file?: File | undefined | null) {
    if (file) this.file = file;
    if (file === null) this.file = undefined;
    if (this.hasUpdate && this._item) {
      this._storage.store(this._item.file, this.path);
    }
    this.hasUpdate = false;
    for (const item of this.removedItems) {
      this._storage.delete(this.pathFor(item.identifier));
    }
    this.removedItems = [];
  }

  /**
   * Downloads a file from the given URL and sets it as the current file.
   * @param url - The URL of the file to download.
   * @returns The downloaded file.
   */
  download(url: string): File {
    return (this.file = actions.download(url));
  }

  protected get path() {
    return this.pathFor(this._item?.identifier ?? "");
  }

  protected pathFor(identifier: string) {
    return `${this.storeDir}/${identifier}`;
  }
}
