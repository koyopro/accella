import { scope } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";
import { Post } from "./index.js";

export class PostModel extends ApplicationRecord {
  override validateAttributes() {
    this.validates("title", { presence: true });
  }

  @scope
  static john() {
    return Post.where({ title: "John" });
  }
}
