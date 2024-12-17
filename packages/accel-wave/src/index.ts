import fs from "fs";
import path from "path";

export class FileStorage {
  async store(file: File) {
    const filePath = new URL(`../public/uploads/${file.name}`, import.meta.url).pathname;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, await file.text());
  }
}
