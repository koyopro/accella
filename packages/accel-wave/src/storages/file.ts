import fs from "fs";
import { basename } from "path";
import { Config } from "../config.js";
import { actions } from "../worker/index.js";
import { type Storage } from "./index.js";

export class FileStorage implements Storage {
  constructor(public config: Config) {}

  store(file: File, identifier: string) {
    const filePath = new URL(`${this.config.root}/${identifier}`, import.meta.url).pathname;
    actions.writeFile(filePath, file);
  }

  retrive(identifier: string) {
    const filePath = new URL(`${this.config.root}/${identifier}`, import.meta.url).pathname;
    return new File([fs.readFileSync(filePath)], basename(filePath));
  }

  delete(identifier: string) {
    const filePath = new URL(`${this.config.root}/${identifier}`, import.meta.url).pathname;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  url(path: string) {
    return new URL(`${this.config.root}/${path}`, import.meta.url);
  }
}
