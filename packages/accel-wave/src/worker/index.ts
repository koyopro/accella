import fs from "fs";
import path from "path";
import { defineSyncWorker } from "sync-actions";
import { download } from "./download.js";
import { deleteS3, getSignedS3Url, loadS3, writeS3 } from "./s3.js";

export const { actions, worker } = defineSyncWorker(import.meta.filename, {
  writeFile: async (filePath: string, file: File) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, await file.text());
  },

  writeS3,
  deleteS3,
  loadS3,
  getSignedS3Url,

  download,
}).launch();
