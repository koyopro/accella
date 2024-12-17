import fs from "fs";
import path from "path";
import { BaseUploader, FileStorage } from "../src";

test("store()", () => {
  const storage = new FileStorage(new BaseUploader());
  const file = buildFile();

  storage.store(file);

  const filePath = path.resolve(__dirname, "../public/uploads/example.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  expect(content).toBe("Hello");
});

test("store() with storeDir", () => {
  const storage = new FileStorage(new BaseUploader({ root: "../tmp", storeDir: "custom" }));
  const file = buildFile();

  storage.store(file);

  const filePath = path.resolve(__dirname, "../tmp/custom/example.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  expect(content).toBe("Hello");
});

const buildFile = () => {
  const fileContent = new Uint8Array([72, 101, 108, 108, 111]); // Binary data for "Hello"
  const blob = new Blob([fileContent], { type: "text/plain" });
  const file = new File([blob], "example.txt", { type: "text/plain" });
  return file;
};
