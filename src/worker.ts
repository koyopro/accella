import { defineRpcSyncActions } from "./synclib";

// test global variable
let s = 0;

export default defineRpcSyncActions(import.meta.filename, {
  incr: async (a: number) => a + 1,
  magic: (t: number) => ++s + t,
  ping: () => "pong!!",
});
