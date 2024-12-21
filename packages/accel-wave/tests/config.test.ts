import { Config, configureAccelWave } from "src/config";
import { S3Storage } from "src/storages/s3";

test("initAccelWave()", () => {
  configureAccelWave({ storage: S3Storage, storeDir: "test", s3: { region: "ap-northeast-1" } });

  const config = new Config({ s3: { bucket: "test2" } });

  expect(config.storage).toEqual(S3Storage);
  expect(config.storeDir).toBe("test");
  expect(config.s3).toMatchObject({ region: "ap-northeast-1", bucket: "test2" });
});
