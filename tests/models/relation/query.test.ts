import { $user } from "../../factories/user";
import { User } from "../_types";

test("updateAll", () => {
  $user.createList(1, { name: "foo", age: 20 });
  $user.createList(2, { name: "bar", age: 30 });

  User.where({ name: "bar" }).updateAll({ name: "baz", age: undefined });

  expect(User.where({ name: "foo" }).count()).toBe(1);
  expect(User.where({ name: "bar" }).count()).toBe(0);
  expect(User.where({ name: "baz" }).count()).toBe(2);

  expect(User.where({ age: undefined }).count()).toBe(2);
});
