import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class User extends ApplicationRecord {
  static table = "user" as const;
}

registerModel(User);
