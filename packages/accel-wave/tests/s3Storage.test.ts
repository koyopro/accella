import { config } from "dotenv";
import { BaseUploader } from "src/index";
import { S3Storage } from "../src/storages/s3";
import { buildFile } from "./buildFile";

config();

test("store()", (context: any) => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) return context.skip();

  console.log(`test store() with s3 storage. region: ${region}, bucket: ${bucket}`);

  const uploader = new BaseUploader({ s3: { region, bucket } });
  const s3 = new S3Storage(uploader);
  uploader.storage = s3;

  uploader.store(buildFile());
});
