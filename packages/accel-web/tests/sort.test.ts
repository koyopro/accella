import { Model } from "accel-record";
import { Search } from "accel-record/search";
import { sortUrl } from "../src";

class SampleModel extends Model {}

test("sortUrl", () => {
  {
    const q = new Search(SampleModel, {});
    const url = sortUrl(q, "name");
    expect(decodeURI(url)).toBe("?q.s[]=name+asc");
  }
  {
    const q = new Search(SampleModel, {});
    const url = sortUrl(q, "name", { defaultOrder: "desc" });
    expect(decodeURI(url)).toBe("?q.s[]=name+desc");
  }
  {
    const q = new Search(SampleModel, { s: "name asc" });
    const url = sortUrl(q, "name");
    expect(decodeURI(url)).toBe("?q.s[]=name+desc");
  }
  {
    const q = new Search(SampleModel, { s: "name desc" });
    const url = sortUrl(q, "name");
    expect(decodeURI(url)).toBe("?q.s[]=name+asc");
  }
  {
    const q = new Search(SampleModel, { s: ["name desc", "id desc"] });
    const url = sortUrl(q, ["name", "id asc"]);
    expect(decodeURI(url)).toBe("?q.s[]=name+asc&q.s[]=id+asc");
  }
  {
    const request = new Request("http://localhost/?p=3&q.s[]=name+desc");
    const q = new Search(SampleModel, { s: ["name desc"] });
    const url = sortUrl(q, "email", { request });
    expect(decodeURI(url)).toBe("http://localhost/?p=3&q.s[]=email+asc");
  }
});
