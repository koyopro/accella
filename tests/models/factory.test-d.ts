import { $user } from "../factories/user";

test("traits", () => {
  // @ts-expect-error
  $user.build({}, "foo");

  // @ts-expect-error
  $user.create({}, "john", "bar");

  // @ts-expect-error
  $user.buildList(2, {}, "", "withSetting");

  // @ts-expect-error
  $user.createList(2, {}, undefined, "withSetting");
});
