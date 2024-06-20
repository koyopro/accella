import { User } from "..";
import { $user } from "../../factories/user";

test("scope", () => {
  $user.create({ name: "john", age: 19 });
  $user.create({ name: "john", age: 20 });

  expect(User.john().count()).toBe(2);
  expect(User.john().adults().count()).toBe(1);
  expect(User.adults().john().count()).toBe(1);
});
