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
