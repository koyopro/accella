import { workerData } from "worker_threads";
import { defineThreadSyncActions } from "../../src/synclib";

if (workerData.sharedBuffer) {
  throw new Error("Sample error on launching worker.");
}

export default defineThreadSyncActions(import.meta.filename, {});
