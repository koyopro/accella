import fs from "fs";
import { Config } from "../config.js";
import { actions } from "../worker.js";
import { type Storage } from "./index.js";

export class FileStorage implements Storage {
  constructor(public config: Config) {}

  store(file: File) {
    const filePath = new URL(
      `${this.config.root}/${this.config.storeDir}/${this.config.filename}`,
      import.meta.url
    ).pathname;
    actions.writeFile(filePath, file);
  }

  retrive(identifier: string) {
    const filePath = new URL(
      `${this.config.root}/${this.config.storeDir}/${identifier}`,
      import.meta.url
    ).pathname;
    return new File([fs.readFileSync(filePath)], identifier);
  }

  url(identifier: string) {
    return new URL(`${this.config.root}/${this.config.storeDir}/${identifier}`, import.meta.url);
  }
}
