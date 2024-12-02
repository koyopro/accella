import { hasSecurePassword, Mix } from "accel-record";
import { actions } from "src/sync/actions.js";
import { ApplicationRecord } from "./applicationRecord.js";

export class AccountModel extends Mix(ApplicationRecord, hasSecurePassword()) {
  avatar: File | undefined;

  uploadAvatar() {
    if (this.avatar) {
      const result = actions.uploadImage(this.avatar, "kydev", "sync-test.png");
      console.log(result);
    }
  }
}
