import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Setting extends ApplicationRecord {}

registerModel(Setting);
