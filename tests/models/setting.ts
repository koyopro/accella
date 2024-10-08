import { attributes } from "accel-record/attributes";
import { ApplicationRecord } from "./applicationRecord.js";

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

  counter = attributes.integer(0);

  override validateAttributes() {
    if (this.threshold && this.threshold < 0) {
      this.errors.add("threshold", "must be greater than or equal to 0");
    }
  }
}
