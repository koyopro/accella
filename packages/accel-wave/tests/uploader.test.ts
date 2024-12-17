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
  const file = buildFile();

  uploader.store(file);

  const filePath = path.resolve(__dirname, "../public/uploads/example.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  expect(content).toBe("Hello");
});

test("store() with storeDir", () => {
  const uploader = new MyUploader({ root: "../tmp", storeDir: "custom" });
  const file = buildFile();

  uploader.store(file);

  const filePath = path.resolve(__dirname, "../tmp/custom/myfile.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  expect(content).toBe("Hello");
});

const buildFile = () => {
  const fileContent = new Uint8Array([72, 101, 108, 108, 111]); // Binary data for "Hello"
  const blob = new Blob([fileContent], { type: "text/plain" });
  const file = new File([blob], "example.txt", { type: "text/plain" });
  return file;
};
