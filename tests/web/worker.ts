import { FileHandle } from "fs/promises";
import { defineSyncWorker } from "../../src/synclib";

export class MyError extends Error {
  name = "MyError";
  constructor(
    message: string,
    public prop1: string
  ) {
    super(message);
  }
}

let s = 0;
export default defineSyncWorker(import.meta.filename, {
  incr: async (a: number) => a + 1,
  magic: (t: number) => ++s + t,
  ping: () => "pong!?",
  readFile: async (fileHandle: FileHandle) => {
    const stats = await fileHandle.stat();
    const buffer = Buffer.alloc(stats.size);
    await fileHandle.read(buffer, 0, stats.size, 0);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    return arrayBuffer;
  },
  file: async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    return arrayBuffer;
  },
  errorSample: () => {
    throw new Error("errorSample");
  },
  myErrorTest: () => {
    throw new MyError("myErrorTest", "foo");
  },
});
