import { defineFactory } from "accel-record-factory";
import { Company } from "../models/index.js";

export const CompanyFactory = defineFactory(Company, {
  // name: "MyString"
});

export { CompanyFactory as $Company };
