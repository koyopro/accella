import { hasSecurePassword, Mix } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class UserModel extends Mix(ApplicationRecord, hasSecurePassword()) {}
