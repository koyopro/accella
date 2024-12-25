import { ApplicationRecord } from "./applicationRecord.js";
import { actions } from "./workers/sample.js";

export class EmployeeModel extends ApplicationRecord {
  // For testing prisma-generator-accel-record
  methodWithSyncAction() {
    actions.sleep(1000);
  }
}
