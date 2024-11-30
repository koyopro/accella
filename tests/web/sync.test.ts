import { open } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import actions from "./worker";
import fail from "./workerWithError";

const client = actions.launch();

test("sync actinos", async () => {
  expect(client.ping()).toBe("pong!?");
  expect(client.incr(3)).toBe(4);
  expect(client.magic(0)).toBe(1);
  expect(client.magic(1)).toBe(3);
  expect(client.magic(2)).toBe(5);
  expect(client.errorSample).toThrowError("errorSample");
  try {
    client.myErrorTest();
  } catch (e) {
    expect(e).toMatchObject({ name: "MyError", message: "myErrorTest", prop1: "foo" });
  }
});

test("sync file read", async () => {
  const filepath = fileURLToPath(path.join(import.meta.url, "../sample.txt"));
  const fileHandle = await open(filepath, "r");
  const arrayBuffer = client.readFile(fileHandle);
  const textDecoder = new TextDecoder("utf-8");
  const text = textDecoder.decode(arrayBuffer);
  expect(text).toMatch("I could read a file.");
});

test("sync actinos with error", async () => {
  fail.launch();
  await new Promise<void>((resolve) => {
    fail.getWorker()!.on("error", (error) => {
      expect(error).toMatchObject({ message: "Sample error on launching worker." });
      resolve();
    });
  });
});
