import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Post extends ApplicationRecord {
  static table = "post" as const;
}

registerModel(Post);
