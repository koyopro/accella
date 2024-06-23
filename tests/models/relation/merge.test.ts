import { User } from "..";
import { $user } from "../../factories/user";

test("merge()", () => {
  $user.create({ name: "foo", age: 20 });
  $user.create({ name: "foo", age: 30 });
  $user.create({ name: "bar", age: 20 });
  const r1 = User.where({ name: "foo" });
  const r2 = User.where({ age: 20 });

  expect(r1.count()).toBe(2);
  expect(r2.count()).toBe(2);
  expect(r1.merge(r2).count()).toBe(1);
});
