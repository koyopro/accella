import { launchSyncWorker } from "../../../../src/synclib";
import { uploadImageToS3 } from "./uploadImageToS3";

export const { actions } = launchSyncWorker(import.meta.filename, {
  uploadImage: uploadImageToS3,
});
