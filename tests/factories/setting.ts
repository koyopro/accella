import { Setting } from "../models/index.js";
import { defineFactory } from "accel-record-factory";

export const SettingFactory = defineFactory(Setting, () => ({
  threshold: undefined,
}));

export { SettingFactory as $setting };
