import { hasSecurePassword, Mix } from "accel-record";
import { actions } from "src/sync/actions.js";
import { ApplicationRecord } from "./applicationRecord.js";

export class AvatarUploader {
  file: File | undefined;

  constructor(
    private model: any,
    public attr: string
  ) {
    model.callbacks.before.save.push(() => this.upload());
  }

  upload() {
    if (this.file) {
      const fileName = `avatar-${Date.now()}.png`;
      const result = actions.uploadImage(this.file, "kydev", fileName);
      console.log(result);
      this.model[this.attr] = fileName;
    }
  }

  get url() {
    if (!this.model[this.attr]) return undefined;

    return `https://kydev.s3.ap-northeast-1.amazonaws.com/${this.model[this.attr]}`;
  }
}

export class AccountModel extends Mix(ApplicationRecord, hasSecurePassword()) {
  avatar = new AvatarUploader(this, "avatarPath");
}
