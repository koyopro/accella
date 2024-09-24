import { defineRpcSyncActions } from "./synclib";

export default defineRpcSyncActions({
  incr: async (a: number) => a + 1,
  ping: () => "pong!!",
});
