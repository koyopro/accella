import { attribute, scope } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class PostModel extends ApplicationRecord {
  @scope
  static john() {
    return this.where({ title: "John" });
  }
  override validateAttributes() {
    this.validates("title", { presence: true });
  }
  @attribute
  set hidden(value: boolean) {
    this.published = !value;
  }
}
