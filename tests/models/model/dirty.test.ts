import { $user } from "../../factories/user";

test("isChanged()", () => {
  const user = $user.build({ name: "foo" });
  expect(user.isChanged()).toBe(false);
  expect(user.isChanged("name")).toBe(false);
  expect(user.isChanged("email")).toBe(false);
  // @ts-expect-error
  user.isChanged("foo");

  user.name = "hoge";
  expect(user.isChanged()).toBe(true);
  expect(user.isChanged("name")).toBe(true);
  expect(user.isChanged("email")).toBe(false);

  user.save();
  expect(user.isChanged()).toBe(false);
  expect(user.isChanged("name")).toBe(false);
  expect(user.isChanged("email")).toBe(false);

  user.email = "foo@example.com";
  expect(user.isChanged()).toBe(true);
  expect(user.isChanged("name")).toBe(false);
  expect(user.isChanged("email")).toBe(true);
});
