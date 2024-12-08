import { launchSyncWorker } from "../../src/synclib";

export const { actions, getWorker, stopWorker } = launchSyncWorker(import.meta.filename, {
  ping: () => "pong!?",
});
