import { Setting } from "../models/setting.js";
import { defineFactory } from "accel-record-factory";

export const SettingFactory = defineFactory(Setting, ({ seq }) => ({
  threshold: undefined,
}));

export { SettingFactory as $setting };
