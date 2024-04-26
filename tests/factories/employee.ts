import { defineFactory } from "accel-record-factory";
import { Employee } from "../models/index.js";

export const EmployeeFactory = defineFactory(Employee, {
  // name: "MyString",
  // companyId: 1
});

export { EmployeeFactory as $Employee };
