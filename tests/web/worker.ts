import { defineThreadSyncActions } from "../../src/synclib";

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
export default defineThreadSyncActions(import.meta.filename, {
  incr: async (a: number) => a + 1,
  magic: (t: number) => ++s + t,
  ping: () => "pong!?",
  errorSample: () => {
    throw new Error("errorSample");
  },
  myErrorTest: () => {
    throw new MyError("myErrorTest", "foo");
  },
});
