import { $Profile } from "../../factories/profile";
import { $user } from "../../factories/user";

test("validation callbacks", () => {
  const profile = $Profile.build({});
  expect(profile.data).toEqual([]);

  profile.isValid();
  expect(profile.data).toEqual(["beforeValidation", "afterValidation"]);
});

test("create callbacks", () => {
  const profile = $Profile.create({ user: $user.create() });
  expect(profile.data).toEqual([
    "beforeValidation",
    "afterValidation",
    "beforeSave",
    "beforeCreate",
    "afterCreate",
    "afterSave",
  ]);
});

test("update callbacks", () => {
  const profile = $Profile.create({ user: $user.create() });
  profile.update({ data: [] });
  expect(profile.data).toEqual([
    "beforeValidation",
    "afterValidation",
    "beforeSave",
    "beforeUpdate",
    "afterUpdate",
    "afterSave",
  ]);
});

test("destroy callbacks", () => {
  const profile = $Profile.create({ user: $user.create() });
  profile.data = [];
  profile.destroy();
  expect(profile.data).toEqual(["beforeDestroy", "afterDestroy"]);
});
