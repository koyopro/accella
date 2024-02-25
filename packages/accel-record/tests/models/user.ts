import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class User extends ApplicationRecord {}

registerModel(User);
