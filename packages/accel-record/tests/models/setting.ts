import { Model, registerModel } from "accel-record-core";

export class Setting extends Model {
  static table = "setting" as const;
}

registerModel(Setting);
