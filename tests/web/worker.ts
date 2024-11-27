import { defineThreadSyncActions } from "../../src/synclib";

let s = 0;
export default defineThreadSyncActions(import.meta.filename, {
  incr: async (a: number) => a + 1,
  magic: (t: number) => ++s + t,
  ping: () => "pong!?",
});
