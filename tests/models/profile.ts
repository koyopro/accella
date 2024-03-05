import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Profile extends ApplicationRecord {
  static table = "profiles";
}

registerModel(Profile);
