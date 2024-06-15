import { before } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends ApplicationRecord {
  @before("create")
  hoge() {
    console.log("hoge");
    console.log(this.constructor.name);
  }

  fuga() {
    for (const cb of this.callbacks.before.create) {
      cb.call(this);
    }
    console.log("fuga");
  }
}
