import { defineSyncWorker } from "sync-actions";

export const { actions, worker } = defineSyncWorker(import.meta.filename, {
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
}).launch();
