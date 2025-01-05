import { Search } from "accel-record/search";
import { RequestParameters, sortUrl } from "accel-web";
import { User } from "..";
import { $user } from "../../factories/user";

test(".search() with sorts", () => {
  $user.create({ id: 1, age: 30, email: "foo@example.com", name: "foo" });
  $user.create({ id: 2, age: 20, email: "cake@foo.com", name: "bar" });
  $user.create({ id: 3, age: 20, email: "choco@example.com", name: "foobar" });
  $user.create({ id: 4, age: 30, email: "juice@example.com", name: "baz" });

  const subject = (params: any): number[] =>
    User.search(params)
      .result()
      .map((u) => u.id);
  const defaultResult = [1, 2, 3, 4];

  expect(subject({ s: "id asc" })).toEqual(defaultResult);
  expect(subject({ s: "id desc" })).toEqual(defaultResult.slice().reverse());

  expect(subject({ s: ["age desc", "id asc"] })).toEqual([1, 4, 2, 3]);
  expect(subject({ s: ["age desc", "id desc"] })).toEqual([4, 1, 3, 2]);

  // ignored
  expect(subject({ s: "id foo" })).toEqual(defaultResult);
  expect(subject({ s: "foo asc" })).toEqual(defaultResult);
});

test("sortUrl()", async () => {
  $user.create({ id: 1, age: 30, email: "foo@example.com", name: "foo" });
  $user.create({ id: 2, age: 20, email: "cake@foo.com", name: "bar" });
  $user.create({ id: 3, age: 20, email: "choco@example.com", name: "foobar" });
  $user.create({ id: 4, age: 30, email: "juice@example.com", name: "baz" });

  const request = new Request("http://localhost/");
  const fetchIdsFromUrl = async (url: string) => {
    const params = await RequestParameters.from(new Request(url));
    return User.search(params.q)
      .result()
      .map((u) => u.id);
  };

  {
    const q = new Search(User, {});
    const url = sortUrl(q, "name", { request });
    expect(decodeURI(url)).toBe("http://localhost/?q.s[]=name+asc");
    expect(await fetchIdsFromUrl(url)).toEqual([2, 4, 1, 3]);
  }
  {
    const q = new Search(User, {});
    const url = sortUrl(q, "name", {
      defaultOrder: "desc",
      request,
    });
    expect(decodeURI(url)).toBe("http://localhost/?q.s[]=name+desc");
    expect(await fetchIdsFromUrl(url)).toEqual([3, 1, 4, 2]);
  }
  {
    const q = new Search(User, { s: "name asc" });
    const url = sortUrl(q, "name", { request });
    expect(decodeURI(url)).toBe("http://localhost/?q.s[]=name+desc");
    expect(await fetchIdsFromUrl(url)).toEqual([3, 1, 4, 2]);
  }
  {
    const q = new Search(User, { s: "name desc" });
    const url = sortUrl(q, "name", { request });
    expect(decodeURI(url)).toBe("http://localhost/?q.s[]=name+asc");
    expect(await fetchIdsFromUrl(url)).toEqual([2, 4, 1, 3]);
  }
  {
    const q = new Search(User, { s: ["age desc", "id desc"] });
    const url = sortUrl(q, "name", {
      keys: ["age", "id asc"],
      request,
    });
    expect(decodeURI(url)).toBe("http://localhost/?q.s[]=age+asc&q.s[]=id+asc");
    expect(await fetchIdsFromUrl(url)).toEqual([2, 3, 1, 4]);
  }
  {
    const request = new Request("http://localhost/?p=3&q.s[]=name+desc");
    const q = new Search(User, { s: ["name desc"] });
    const url = sortUrl(q, "email", { request });
    expect(decodeURI(url)).toBe("http://localhost/?p=3&q.s[]=email+asc");
    expect(await fetchIdsFromUrl(url)).toEqual([2, 3, 1, 4]);
  }
});
