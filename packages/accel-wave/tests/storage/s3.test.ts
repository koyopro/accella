import { config } from "dotenv";
import { Config } from "src/config";
import { BaseUploader } from "src/index";
import { S3Storage } from "../../src/storages/s3";
import { buildFile } from "../buildFile";

config();

test("store()", (context: any) => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) return context.skip();

  console.log(`test store() with s3 storage. region: ${region}, bucket: ${bucket}`);

  const config = new Config({ s3: { region, Bucket: bucket } });
  const s3 = new S3Storage(config);

  const file = buildFile();
  s3.store(file);

  const retrivedFile = s3.retrive(file.name);
  expect(retrivedFile.name).toBe(file.name);

  expect(s3.url(file.name)).toMatch(
    new RegExp(
      `https://${bucket}.s3.${region}.amazonaws.com/example.txt\\?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=.+`
    )
  );

  s3.delete(file.name);
});

test("S3Storage with Uploader", () => {
  const uploader = new BaseUploader({
    storage: S3Storage,
    s3: { region: "ap-northeast-1", Bucket: "my-bucket", ACL: "public-read" },
  });
  uploader.filename = "example.txt";
  expect(uploader.url()?.href).toEqual(
    "https://my-bucket.s3.ap-northeast-1.amazonaws.com/uploads/example.txt"
  );
});
