import fs from "fs";
import { basename } from "path";
import { Config } from "../config.js";
import { actions } from "../worker/index.js";
import { type Storage } from "./index.js";

export class FileStorage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    actions.writeFile(this.url(identifier).pathname, file);
  }

  retrive(identifier: string) {
    const filePath = this.url(identifier).pathname;
    return new File([fs.readFileSync(filePath)], basename(filePath));
  }

  delete(identifier: string) {
    const filePath = this.url(identifier).pathname;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  url(path: string) {
    return new URL(`${this.config.root}/${path}`, import.meta.url);
  }
}
