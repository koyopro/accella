import fs from "fs";
import path from "path";
import { BaseUploader } from "../src";
import { buildFile } from "./buildFile";

class MyUploader extends BaseUploader {
  override get storeDir() {
    return "custom";
  }

  override get filename() {
    return "myfile.txt";
  }
}

test("store()", () => {
  const uploader = new BaseUploader();

  uploader.store(buildFile());

  expect(read("../public/uploads/example.txt")).toBe("Hello");

  const regex = new RegExp("file:///.+/accel-wave/public/uploads/example.txt");
  expect(regex.test(uploader.url()!.href)).toBeTruthy();
});

test("hasUpdate", () => {
  const uploader = new BaseUploader();
  const storeOfStorage = vi.spyOn((uploader as any)._storage, "store");
  {
    uploader.file = buildFile();
    uploader.store();

    expect(storeOfStorage).toHaveBeenCalledOnce();
  }
  {
    // storeOfStorage is not called here because there are no updates
    uploader.store();

    expect(storeOfStorage).toHaveBeenCalledOnce();
  }
  {
    uploader.store(buildFile());

    expect(storeOfStorage).toHaveBeenCalledTimes(2);
  }
});

test("store() with customize", () => {
  const uploader = new MyUploader({
    root: "../tmp",
    assetHost: "http://localhost",
  });

  uploader.store(buildFile());

  expect(read("../tmp/custom/example.txt")).toBe("Hello");
  expect(uploader.url()!.href).toBe("http://localhost/custom/myfile.txt");
});

const read = (filePath: string) => {
  const absolutePath = path.resolve(__dirname, filePath);
  return fs.readFileSync(absolutePath, "utf-8");
};
