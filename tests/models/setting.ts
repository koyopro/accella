import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

type SettingData = {
  key1?: string;
  key2?: {
    key3?: number;
  };
};

export class Setting extends ApplicationRecord {
  data: SettingData = {
    key1: "hoge",
  };
}

registerModel(Setting);
