import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Setting extends ApplicationRecord {
  data: {
    key1?: string;
    key2?: {
      key3?: number;
    };
  } = {};
}

registerModel(Setting);
