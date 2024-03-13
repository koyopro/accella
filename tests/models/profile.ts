import { registerModel } from "accel-record";
import { ApplicationRecord } from "./applicationRecord";

export class ProfileModel extends ApplicationRecord {
  static table = "profiles";

}

registerModel(ProfileModel);
