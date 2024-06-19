import { ApplicationRecord } from "./applicationRecord.js";
import { User } from "./index.js";

export class UserModel extends ApplicationRecord {
  static john(this: typeof User) {
    return this.where({ name: "John" });
  }
  static adults(this: typeof User) {
    return this.where({ age: { ">=": 20 } });
  }
}
