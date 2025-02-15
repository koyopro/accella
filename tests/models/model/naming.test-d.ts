import { Setting, User } from "..";

test("humanAttributeName", () => {
  User.humanAttributeName("name");
  Setting.humanAttributeName("counter");
  // @ts-expect-error
  User.humanAttributeName("invalid");
  // @ts-expect-error
  Setting.humanAttributeName("foo");
});
