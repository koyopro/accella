import { ApplicationRecord } from "./applicationRecord";

type SettingData = {
  key1?: string;
  key2?: {
    key3?: number;
  };
};

export class SettingModel extends ApplicationRecord {
  data: SettingData = {
    key1: "hoge",
  };
}
