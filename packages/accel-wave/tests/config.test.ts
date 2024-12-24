import { Config, configureAccelWave } from "src/config";
import { FileStorage } from "src/storages/file";
import { S3Storage } from "src/storages/s3";

class MyConfig extends Config {
  id: string | undefined;

  override get storeDir() {
    return `uploads${this.id}`;
  }

  override get s3() {
    return { ...super.s3, ACL: "public-read" as any };
  }
}

test("Config Priority", () => {
  // Default values
  {
    const config = new Config();

    expect(config.storage).toEqual(FileStorage);
    expect(config.storeDir).toBe("uploads");
    expect(config.s3).toBeUndefined();
  }
  // Use global config
  configureAccelWave({
    storage: S3Storage,
    storeDir: "uploads2",
    s3: { region: "ap-northeast-1" },
  });
  {
    const config = new Config();

    expect(config.storage).toEqual(S3Storage);
    expect(config.storeDir).toBe("uploads2");
    expect(config.s3).toMatchObject({ region: "ap-northeast-1" });
  }
  // Use custom method
  {
    const config = new MyConfig();
    config.id = "3";

    expect(config.storage).toEqual(S3Storage);
    expect(config.storeDir).toBe("uploads3");
    expect(config.s3).toMatchObject({ region: "ap-northeast-1", ACL: "public-read" });
  }
  // Use options
  {
    const config = new MyConfig({ storeDir: "uploads4", s3: { Bucket: "test2", ACL: "private" } });

    expect(config.storage).toEqual(S3Storage);
    expect(config.storeDir).toBe("uploads4");
    expect(config.s3).toMatchObject({
      region: "ap-northeast-1",
      ACL: "private",
      Bucket: "test2",
    });
  }
});
