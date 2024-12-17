import fs from "fs";
import path from "path";
import { defineSyncWorker } from "sync-actions";

export const { actions, worker } = defineSyncWorker(import.meta.filename, {
  writeFile: async (filePath: string, file: File) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, await file.text());
  },
}).launch();
