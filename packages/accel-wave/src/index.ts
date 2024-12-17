import { actions } from "./worker.js";

export class FileStorage {
  store(file: File) {
    const filePath = new URL(`../public/uploads/${file.name}`, import.meta.url).pathname;
    actions.writeFile(filePath, file);
  }
}
