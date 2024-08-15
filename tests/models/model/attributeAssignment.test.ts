import { User } from "..";

test("cast number", () => {
  const user = User.build({});
  expect(user.age).toBeUndefined();
  user.assignAttributes({ age: "" });
  expect(user.age).toBeUndefined();
  user.assignAttributes({ age: 20 });
  expect(user.age).toBe(20);
});
