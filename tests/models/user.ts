import { scope } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends ApplicationRecord {
  @scope
  static john() {
    return this.where({ name: "John" });
  }
  @scope
  static adults() {
    return this.where({ age: { ">=": 20 } });
  }

  static bio_cont(value: string) {
    return this.joins("Profile").where({
      Profile: { bio: { like: `%${value}%` } },
    });
  }

  static override searchableScopes = ["bio_cont"];
}
