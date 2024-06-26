import { hasSecurePassword, Mix } from "accel-record-core";
import { User } from "..";
import { $user } from "../../factories/user";
import { ApplicationRecord } from "../applicationRecord";

test("hasSecurePassword()", () => {
  const user = $user.build({});
  user.password = "";
  user.passwordConfirmation = "";
  expect(user.save()).toBe(false);
  expect(user.errors.fullMessages).toEqual(["Password can't be blank"]);

  user.password = "xBOHdowK5e2YjQ1s";
  expect(user.save()).toBe(false);
  expect(user.errors.fullMessages).toEqual([
    "PasswordConfirmation does not match password",
  ]);

  user.passwordConfirmation = "xBOHdowK5e2YjQ1s";
  expect(user.save()).toBe(true);
  expect(user.errors.fullMessages).toEqual([]);

  expect(user.passwordDigest).not.toBeUndefined();

  expect(user.authenticate("invalid")).toBe(false);
  expect(user.authenticate("xBOHdowK5e2YjQ1s")).toBe(true);

  const u = User.find(user.id!);
  expect(u.authenticate("invalid")).toBe(false);
  expect(u.authenticate("xBOHdowK5e2YjQ1s")).toBe(true);

  // @ts-expect-error
  user.hoge;
});

test("hasSecurePassword() with validations: false", () => {
  class NoValidationsUser extends Mix(
    ApplicationRecord,
    hasSecurePassword({ validations: false })
  ) {}
  const user = new NoValidationsUser();
  user.passwordConfirmation = "nomatch";
  expect(user.isValid()).toBe(true);
});

test("hasSecurePassword() with custom attribute", () => {
  class CustomAttributeUser extends Mix(
    ApplicationRecord,
    hasSecurePassword({ attribute: "recovery" })
  ) {}
  const user = new CustomAttributeUser();
  user.recovery = user.recoveryConfirmation = "xBOHdowK5e2YjQ1s";
  expect(user.isValid()).toBe(true);
});
