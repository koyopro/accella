import { User } from "..";
import { $user } from "../../factories/user";

test(".search()", () => {
  $user.create({ email: "cookie@example.com", name: "foo" });
  $user.create({ email: "cake@foo.com", name: "bar" });
  $user.create({ email: "chocolate@example.com", name: "foobar" });
  $user.create({ email: "juice@example.com", name: "baz" });

  const subject = (params: any) => User.search(params).result().count();

  expect(subject({})).toEqual(4);
  expect(subject({ name_eq: "foo" })).toEqual(1);
  expect(subject({ name_cont: "bar" })).toEqual(2);
  expect(subject({ email_or_name_cont: "foo" })).toEqual(3);
});
