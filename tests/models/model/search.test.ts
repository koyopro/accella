import { User } from "..";
import { $user } from "../../factories/user";

test(".search()", () => {
  $user.create({ email: "cookie@example.com", name: "foo" });
  $user.create({ email: "cake@foo.com", name: "bar" });
  $user.create({ email: "chocolate@example.com", name: "foobar" });
  $user.create({ email: "juice@example.com", name: "baz" });

  const u = User.all()
    .where({ name: "hoge" })
    .where({ age: 20 })
    .or({ name: "fuga", age: 30 });

  const r = User.where({ email: { contains: "foo" } }).or({
    name: { contains: "foo" },
  });
  expect(User.search({}).result().count()).toEqual(4);
  expect(User.search({ name_eq: "foo" }).result().count()).toEqual(1);
  expect(User.search({ name_cont: "bar" }).result().count()).toEqual(2);
  expect(User.search({ email_or_name_cont: "foo" }).result().count()).toEqual(
    3
  );
});
