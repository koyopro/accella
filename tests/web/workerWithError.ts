import { defineSyncWorker } from "accel-record-core/dist/synclib/index.js";
import { workerData } from "worker_threads";

if (workerData.sharedBuffer) {
  throw new Error("Sample error on launching worker.");
}

export default defineSyncWorker(import.meta.filename, {});
