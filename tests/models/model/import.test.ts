import { $user } from "../../factories/user.js";
import { User } from "../index.js";

test(".import", () => {
  const users = [
    $user.build({ email: "foo@example.com" }),
    $user.build({ email: "bar@example.com" }),
  ];
  User.import(users);
  expect(User.count()).toBe(2);
});
