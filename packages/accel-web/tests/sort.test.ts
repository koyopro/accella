import { Model } from "accel-record";
import { Search } from "accel-record/search";
import { sortUrl } from "../src";

class SampleModel extends Model {}

test("sortUrl", () => {
  {
    const q = new Search(SampleModel, {});
    const url = sortUrl(q, "name");
    expect(url).toBe("?q.s=name+asc");
  }
  {
    const q = new Search(SampleModel, {});
    const url = sortUrl(q, "name", { defaultOrder: "desc" });
    expect(url).toBe("?q.s=name+desc");
  }
  {
    const q = new Search(SampleModel, { s: "name asc" });
    const url = sortUrl(q, "name");
    expect(url).toBe("?q.s=name+desc");
  }
  {
    const q = new Search(SampleModel, { s: "name desc" });
    const url = sortUrl(q, "name");
    expect(url).toBe("?q.s=name+asc");
  }
  {
    const q = new Search(SampleModel, { s: ["name desc", "id desc"] });
    const url = sortUrl(q, "name", { keys: ["name", "id asc"] });
    expect(url).toBe("?q.s=name+asc%2Cid+asc");
  }
  {
    const request = new Request("http://localhost/?p=3&q.s=name+desc");
    const q = new Search(SampleModel, {});
    const url = sortUrl(q, "name", { request });
    expect(url).toBe("http://localhost/?p=3&q.s=name+asc");
  }
});
