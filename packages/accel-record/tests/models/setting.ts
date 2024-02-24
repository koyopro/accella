import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Setting extends ApplicationRecord {
  static table = "setting" as const;
}

registerModel(Setting);
