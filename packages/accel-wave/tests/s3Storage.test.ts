import { config } from "dotenv";
import { Config } from "src/config";
import { S3Storage } from "../src/storages/s3";
import { buildFile } from "./buildFile";

config();

test("store()", (context: any) => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) return context.skip();

  console.log(`test store() with s3 storage. region: ${region}, bucket: ${bucket}`);

  const config = new Config({ s3: { region, bucket } });
  const s3 = new S3Storage(config);

  const file = buildFile();
  s3.store(file);

  const retrivedFile = s3.retrive(file.name);
  expect(retrivedFile.name).toBe(file.name);
});
