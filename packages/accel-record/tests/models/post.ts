import { Model, registerModel } from "accel-record-core";

export class Post extends Model {
  static table = "post" as const;
}

registerModel(Post);
