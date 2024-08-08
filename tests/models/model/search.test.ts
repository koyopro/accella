import { Profile, User } from "..";
import { $post } from "../../factories/post";
import { $postTag } from "../../factories/postTag";
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

  expect(subject({ name_not_eq: "foo" })).toEqual(3);
  expect(subject({ name_not_cont: "bar" })).toEqual(2);
  expect(subject({ name_not_start: "bar" })).toEqual(3);
  expect(subject({ name_not_end: "bar" })).toEqual(2);
  expect(subject({ name_not_in: ["foo", "bar", "baz"] })).toEqual(1);
  expect(subject({ name_does_not_match: "ba%" })).toEqual(2);

  expect(subject({ name_cont_all: ["bar", "foo"] })).toEqual(1);
  expect(subject({ name_end_all: ["r", "ar", "obar"] })).toEqual(1);
  expect(subject({ name_matches_all: ["foo%", "%bar"] })).toEqual(1);

  expect(subject({ name_cont_any: ["bar", "foo"] })).toEqual(3);
  expect(subject({ name_start_any: ["a", "b", "c"] })).toEqual(2);
  expect(subject({ name_matches_any: ["foo%", "%bar"] })).toEqual(3);

  expect(subject({ name_not_cont_all: ["bar", "foo"] })).toEqual(1);
  expect(subject({ name_not_start_all: ["bar", "foo"] })).toEqual(1);
  expect(subject({ name_does_not_match_all: ["az%", "ba%"] })).toEqual(2);

  expect(subject({ name_not_cont_any: ["bar", "foo"] })).toEqual(3);
  expect(subject({ name_not_start_any: ["b", "f"] })).toEqual(4);
  expect(subject({ name_not_end_any: ["o", "r"] })).toEqual(4);
  expect(subject({ name_does_not_match_any: ["%", "%z"] })).toEqual(3);

  expect(subject({ age_eq: 20 })).toEqual(1);
  expect(subject({ age_lt: 20 })).toEqual(1);
  expect(subject({ age_lte: 20 })).toEqual(2);
  expect(subject({ age_gt: 20 })).toEqual(1);
  expect(subject({ age_gte: 20 })).toEqual(2);
  expect(subject({ age_in: [20, 30] })).toEqual(2);
  expect(subject({ age_null: 1 })).toEqual(1);

  expect(subject({ age_not_null: 1 })).toEqual(3);

  expect(subject({ age_lt_all: [21, 15] })).toEqual(1);

  expect(subject({ age_gte_any: [30, 20] })).toEqual(2);

  // second query is ignored because attribute is not found
  // third query is ignored because predicate is not found
  expect(subject({ name_eq: "foo", foo_eq: "bar", name_foo: 1 })).toEqual(1);

  $Profile.create({
    userId: 1,
    bio: "foo",
    enabled: true,
  });
  $Profile.create({ userId: 2, bio: "", enabled: false });
  $Profile.create({ userId: 3, bio: null as any, enabled: false });

  const subject2 = (params: any): number =>
    Profile.search(params).result().count();

  expect(subject2({})).toEqual(3);
  expect(subject2({ enabled_true: 1 })).toEqual(1);
  expect(subject2({ enabled_false: 1 })).toEqual(2);
  expect(subject2({ bio_blank: 1 })).toEqual(2);
  expect(subject2({ bio_present: 1 })).toEqual(1);

  expect(subject({ Profile_bio_eq: "foo" })).toEqual(1);
  expect(subject({ Profile_enabled_true: 1 })).toEqual(1);
  expect(subject({ Profile_enabled_false: 1 })).toEqual(2);
  expect(subject({ Profile_bio_blank: 1 })).toEqual(2);
  expect(subject({ Profile_bio_present: 1 })).toEqual(1);

  // Ensure that jonis is executed only once
  expect(
    subject({
      Profile_bio_eq: "foo",
      Profile_enabled_true: 1,
    })
  ).toEqual(1);

  // use searchableScope
  expect(subject({ bio_cont: "foo" })).toEqual(1);

  $post.create({ authorId: 1, tags: [$postTag.build({ name: "tag1" })] });
  $post.create({ authorId: 2, tags: [$postTag.build({ name: "" })] });
  // multi level joins
  expect(subject({ posts_tags_name_eq: "tag1" })).toEqual(1);
  expect(subject({ posts_tags_name_blank: 1 })).toEqual(1);
  expect(subject({ posts_tags_name_present: 1 })).toEqual(1);
});

test("Relation#search()", () => {
  $user.create({ age: 20, name: "foo" });
  $user.create({ age: 20, name: "bar" });
  $user.create({ age: 30, name: "foo" });

  expect(
    User.where({ age: 20 }).search({ name_eq: "foo" }).result().count()
  ).toEqual(1);
});
