import { before, hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class AccountModel extends Mix(ApplicationRecord, hasSecurePassword()) {
  @before("save")
  foo() {}
}
