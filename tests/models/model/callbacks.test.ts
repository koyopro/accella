import { $Company } from "../../factories/company";
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
  profile.data = [];
  profile.update({ bio: "updated" });
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

test("add same callbacks to multiple methods", () => {
  const company = $Company.create({});
  company.data = [];
  company.destroy();
  expect(company.data).toEqual(["beforeDestroy1", "beforeDestroy2"]);
});

test("add multiple callbacks to the same method", () => {
  const company = $Company.create({});
  expect(company.data).toEqual(["beforeCreateAndAfterSave", "beforeCreateAndAfterSave"]);
});
