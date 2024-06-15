import { after, before } from "accel-record";
import { ApplicationRecord } from "./applicationRecord.js";

export class CompanyModel extends ApplicationRecord {
  data: string[] = [];

  @before("destroy")
  beforeDestroy1() {
    this.data.push("beforeDestroy1");
  }

  @before("destroy")
  beforeDestroy2() {
    this.data.push("beforeDestroy2");
  }

  @before("create")
  @after("save")
  beforeCreateAndAfterSave() {
    this.data.push("beforeCreateAndAfterSave");
  }
}
