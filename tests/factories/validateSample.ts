import { ValidateSample } from "../models/index.js";
import { defineFactory } from "accel-record-factory";

export const ValidateSampleFactory = defineFactory(ValidateSample, () => ({
  accepted: true,
  key: "small",
  size: "medium",
  pattern: "value",
  count: 1,
}));

export { ValidateSampleFactory as $ValidateSample };
