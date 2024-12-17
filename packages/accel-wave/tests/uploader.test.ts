import fs from "fs";
import path from "path";
import { BaseUploader } from "../src";

class MyUploader extends BaseUploader {
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

test("store() with customize", () => {
  const uploader = new MyUploader({
    root: "../tmp",
    storeDir: "custom",
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

const buildFile = () => {
  const fileContent = new Uint8Array([72, 101, 108, 108, 111]); // Binary data for "Hello"
  const blob = new Blob([fileContent], { type: "text/plain" });
  const file = new File([blob], "example.txt", { type: "text/plain" });
  return file;
};
