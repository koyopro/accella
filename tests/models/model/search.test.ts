import { Profile, User } from "..";
import { $Profile } from "../../factories/profile";
import { $user } from "../../factories/user";

test(".search()", () => {
  $user.create({ id: 1, age: 10, email: "foo@example.com", name: "foo" });
  $user.create({ id: 2, age: 20, email: "cake@foo.com", name: "bar" });
  $user.create({ id: 3, age: 30, email: "choco@example.com", name: "foobar" });
  $user.create({ id: 4, email: "juice@example.com", name: "baz" });

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
  expect(subject({ age_gt: 20 })).toEqual(1);
  expect(subject({ age_gte: 20 })).toEqual(2);
  expect(subject({ age_in: [20, 30] })).toEqual(2);
  expect(subject({ age_null: 1 })).toEqual(1);

  $Profile.create({ userId: 1, bio: "foo", enabled: true });
  $Profile.create({ userId: 2, bio: "", enabled: false });
  $Profile.create({ userId: 3, bio: null as any, enabled: false });

  const subject2 = (params: any): number =>
    Profile.search(params).result().count();

  expect(subject2({})).toEqual(3);
  expect(subject2({ enabled_true: 1 })).toEqual(1);
  expect(subject2({ enabled_false: 1 })).toEqual(2);
  expect(subject2({ bio_blank: 1 })).toEqual(2);
  expect(subject2({ bio_present: 1 })).toEqual(1);
});
