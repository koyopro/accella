import { launchSyncWorker } from "accel-record-core/dist/synclib/index.js";

export const { actions, getWorker, stopWorker } = launchSyncWorker(import.meta.filename, {
  ping: () => "pong!?",
});
