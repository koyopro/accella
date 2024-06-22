import { ApplicationRecord } from "./applicationRecord.js";
import { scope } from "accel-record";
import { User } from "./index.js";

export class UserModel extends ApplicationRecord {
  @scope
  static john() {
    return User.where({ name: "John" });
  }
  @scope
  static adults() {
    return User.where({ age: { ">=": 20 } });
  }
  // @ts-expect-error
  @scope
  static teenagers() {
    User.count();
  }
}
