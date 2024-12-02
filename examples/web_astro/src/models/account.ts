import { hasSecurePassword, Mix } from "accel-record";
import { actions } from "src/sync/actions.js";
import { ApplicationRecord } from "./applicationRecord.js";

export class AccountModel extends Mix(ApplicationRecord, hasSecurePassword()) {
  avatar: File | undefined;

  constructor() {
    super();
    this.callbacks.before.save.push(this.uploadAvatar);
  }

  get avatarUrl() {
    if (!this.avatarPath) return undefined;

    return `https://kydev.s3.ap-northeast-1.amazonaws.com/${this.avatarPath}`;
  }

  uploadAvatar() {
    if (this.avatar) {
      const fileName = `avatar-${Date.now()}.png`;
      const result = actions.uploadImage(this.avatar, "kydev", fileName);
      console.log(result);
      this.avatarPath = fileName;
    }
  }
}
