import { ValidateSample } from "../models/index.js";
import { defineFactory } from "accel-record-factory";

export const ValidateSampleFactory = defineFactory(
  ValidateSample,
  ({ seq }) => ({
    accepted: true,
    key: "small",
  })
);

export { ValidateSampleFactory as $ValidateSample };
