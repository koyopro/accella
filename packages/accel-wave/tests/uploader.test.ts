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

  const target = uploader.url()!.pathname;
  expect(fs.existsSync(target)).toBeTruthy();

  uploader.store(null); // this should remove the file
  expect(fs.existsSync(target)).toBeFalsy();
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

test("download()", () => {
  const uploader = new BaseUploader();

  uploader.download("https://avatars.githubusercontent.com/u/0?v=1");
  expect(uploader.file).toBeDefined();
  expect(uploader.file!.size).toBe(5065);

  expect(() => uploader.download("invalid_url")).toThrowError("Invalid URL");
  expect(() => uploader.download("https://raw.githubusercontent.com/github/x/y/z")).toThrowError(
    "Failed to get 'https://raw.githubusercontent.com/github/x/y/z' (404)"
  );
});
