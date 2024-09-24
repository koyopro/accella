import { defineRpcSyncActions } from "./synclib";

export default defineRpcSyncActions(import.meta.filename, {
  incr: async (a: number) => a + 1,
  ping: () => "pong!!",
});
