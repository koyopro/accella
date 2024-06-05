import { $user } from "../../factories/user";
import { User } from "../_types";

test("#count()", () => {
  $user.createList(2);
  expect(User.all().count()).toBe(2);
});

test("#pluck()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  expect(User.all().pluck("name")).toEqual(["hoge", "fuga"]);
});

test("aggregate", () => {
  $user.create({ age: 21 });
  $user.create({ age: 24 });

  expect(User.all().minimum("age")).toBe(21);
  expect(User.all().maximum("age")).toBe(24);
  expect(User.all().average("age")).toBe(22.5);
});
