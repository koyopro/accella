import type { Model } from "accel-record";
import type { ConfigOptions } from "./config.js";
import { Config } from "./index.js";
import type { Storage } from "./storages/index.js";
import { actions } from "./worker/index.js";

export class Item {
  protected _file: File | undefined;

  constructor(
    public readonly identifier: string,
    protected readonly storage: Storage,
    protected readonly uploader: BaseUploader
  ) {}

  set file(file: File | undefined) {
    this._file = file;
  }

  get file(): File {
    return (this._file ||= this.storage.retrive(this.path));
  }

  get path(): string {
    return pathFor(this.identifier, this.uploader.storeDir);
  }
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

    this._filename = identifier;
    return new Item(identifier, this._storage, this);
  }

  protected get item() {
    return (this._item ||= this.itemByModel());
  }

  set file(file: File | undefined) {
    if (this.item) this.removedItems.push(this.item);
    this._filename = file?.name;
    const filename = this.filename;
    if (file) {
      this._item = new Item(filename, this._storage, this);
      this._item.file = file;
    } else {
      this._item = undefined;
    }
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
      this._storage.delete(item.path);
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
    return this._item?.path ?? pathFor("", this.storeDir);
  }
}

/**
 * Function to generate a file path from a file identifier.
 * @param identifier The file identifier.
 * @param storeDir The directory where the file is stored.
 * @returns The file path.
 */
function pathFor(identifier: string, storeDir: string) {
  return `${storeDir}/${identifier}`;
}
