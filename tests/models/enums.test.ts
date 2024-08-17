import { Profile } from ".";

test("Enums options", () => {
  expect(Profile.role.values.map((v) => v.value)).toEqual(["MEMBER", "ADMIN"]);
  expect(Profile.role.values.map((v) => v.text)).toEqual(["MEMBER", "ADMIN"]);
  expect(Profile.role.options()).toEqual([
    ["MEMBER", "MEMBER"],
    ["ADMIN", "ADMIN"],
  ]);
});
