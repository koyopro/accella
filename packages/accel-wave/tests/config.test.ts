import { Config, configureAccelWave } from "src/config";

test("initAccelWave()", () => {
  configureAccelWave({ storeDir: "test", s3: { region: "ap-northeast-1" } });

  const config = new Config({ s3: { bucket: "test2" } });

  expect(config.storeDir).toBe("test");
  expect(config.s3).toMatchObject({ region: "ap-northeast-1", bucket: "test2" });
});
