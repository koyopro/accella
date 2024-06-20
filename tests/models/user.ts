import { ApplicationRecord } from "./applicationRecord.js";
import { scope } from "accel-record";

export class UserModel extends ApplicationRecord {
  @scope
  static john() {
    return this.where({ name: "John" });
  }
  @scope
  static adults() {
    return this.where({ age: { ">=": 20 } });
  }
}
