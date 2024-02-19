import { Model, registerModel } from "accel-record-core";

export class User extends Model {
  static table = "user";
}

registerModel(User);
