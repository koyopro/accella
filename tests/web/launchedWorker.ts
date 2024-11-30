import { launchSyncWorker } from "../../src/synclib";

export const { actions, getWorker, stop } = launchSyncWorker(import.meta.filename, {
  ping: () => "pong!?",
});
