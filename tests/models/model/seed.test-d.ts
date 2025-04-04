import { User } from "..";

test(".seed()", () => {
  User.seed({ email: "foo@example.com" });

  // @ts-expect-error
  User.seed({ email: "foo@example.com", foo: "bar" });
});
