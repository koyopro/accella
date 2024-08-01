import { User } from "..";
import { $user } from "../../factories/user";

test(".search()", () => {
  $user.create({ age: 10, email: "foo@example.com", name: "foo" });
  $user.create({ age: 20, email: "cake@foo.com", name: "bar" });
  $user.create({ age: 30, email: "chocolate@example.com", name: "foobar" });
  $user.create({ age: 40, email: "juice@example.com", name: "baz" });

  const subject = (params: any): number => User.search(params).result().count();

  expect(subject({})).toEqual(4);
  expect(subject({ name_eq: "foo" })).toEqual(1);
  expect(subject({ name_cont: "bar" })).toEqual(2);
  expect(subject({ email_or_name_cont: "foo" })).toEqual(3);
  expect(subject({ email_and_name_cont: "foo" })).toEqual(1);
  expect(subject({ name_start: "bar" })).toEqual(1);
  expect(subject({ name_end: "bar" })).toEqual(2);
  expect(subject({ name_matches: "ba%" })).toEqual(2);
  expect(subject({ name_in: ["foo", "bar", "baz"] })).toEqual(3);

  expect(subject({ age_eq: 20 })).toEqual(1);
  expect(subject({ age_lt: 20 })).toEqual(1);
  expect(subject({ age_lte: 20 })).toEqual(2);
  expect(subject({ age_gt: 30 })).toEqual(1);
  expect(subject({ age_gte: 30 })).toEqual(2);
  expect(subject({ age_in: [20, 30] })).toEqual(2);
});
