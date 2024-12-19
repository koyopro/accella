import {
  type PutObjectCommandInput,
  type S3ClientConfig,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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
  writeS3: async (s3Config: S3ClientConfig, putConfig: PutObjectCommandInput, file: File) => {
    const s3 = new S3Client(s3Config);
    const command = new PutObjectCommand({
      ...putConfig,
      Body: (await file.arrayBuffer()) as any,
    });

    try {
      return await s3.send(command);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}).launch();