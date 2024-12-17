import fs from "fs";
import path from "path";
import { FileStorage } from "../src";

test("store()", async () => {
  const storage = new FileStorage();
  const fileContent = new Uint8Array([72, 101, 108, 108, 111]); // Binary data for "Hello"
  const blob = new Blob([fileContent], { type: "text/plain" });
  const file = new File([blob], "example.txt", { type: "text/plain" });

  storage.store(file);

  const filePath = path.resolve(__dirname, "../public/uploads/example.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  expect(content).toBe("Hello");
});
