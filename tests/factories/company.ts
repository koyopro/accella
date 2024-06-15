import { defineFactory } from "accel-record-factory";
import { Company } from "../models/index.js";

export const CompanyFactory = defineFactory(Company, {
  name: "My Company",
});

export { CompanyFactory as $Company };
