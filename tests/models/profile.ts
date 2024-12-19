import { after, before } from "accel-record";
import { BaseUploader, mount } from "accel-wave";
import { ApplicationRecord } from "./applicationRecord.js";

export class ProfileModel extends ApplicationRecord {
  static table = "profiles";

  data: string[] = [];

  avatar = mount(this, "avatarPath", new BaseUploader());

  @before("validation")
  beforeValidation() {
    this.data.push("beforeValidation");
  }

  @after("validation")
  afterValidation() {
    this.data.push("afterValidation");
  }

  @before("save")
  beforeSave() {
    this.data.push("beforeSave");
  }

  @after("save")
  afterSave() {
    this.data.push("afterSave");
  }

  @before("create")
  beforeCreate() {
    this.data.push("beforeCreate");
  }

  @after("create")
  afterCreate() {
    this.data.push("afterCreate");
  }

  @before("update")
  beforeUpdate() {
    this.data.push("beforeUpdate");
  }

  @after("update")
  afterUpdate() {
    this.data.push("afterUpdate");
  }

  @before("destroy")
  beforeDestroy() {
    this.data.push("beforeDestroy");
  }

  @after("destroy")
  afterDestroy() {
    this.data.push("afterDestroy");
  }
}
