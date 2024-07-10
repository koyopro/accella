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

  expect(user.passwordDigest).not.toBeFalsy();

  expect(user.authenticate("invalid")).toBe(false);
  expect(user.authenticate("xBOHdowK5e2YjQ1s")).toBe(true);
  expect(user.authenticatePassword("xBOHdowK5e2YjQ1s")).toBe(true);

  const u = User.find(user.id!);
  expect(u.authenticate("invalid")).toBe(false);
  expect(u.authenticate("xBOHdowK5e2YjQ1s")).toBe(true);
  expect(u.authenticatePassword("xBOHdowK5e2YjQ1s")).toBe(true);

  // @ts-expect-error
  user.hoge;
});

test("hasSecurePassword() on create", () => {
  const password = "xBOHdowK5e2YjQ1s";
  const user = $user.build({
    password: password,
    passwordConfirmation: password,
  });
  expect(user.passwordDigest).not.toBeUndefined();
  expect(user.save()).toBe(true);
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
  expect(user.authenticateRecovery("xBOHdowK5e2YjQ1s")).toBe(true);
});

test("hasSecurePassword() multiple", () => {
  class MultiplePasswordUser extends Mix(
    ApplicationRecord,
    hasSecurePassword(),
    hasSecurePassword({ attribute: "recovery", validations: false })
  ) {}
  const user = new MultiplePasswordUser();
  user.password = user.passwordConfirmation = "xBOHdowK5e2YjQ1s";
  user.recovery = user.recoveryConfirmation = "l36pjDtp7TZtBqjm";
  expect(user.isValid()).toBe(true);
  expect(user.authenticate("xBOHdowK5e2YjQ1s")).toBe(true);
  expect(user.authenticatePassword("xBOHdowK5e2YjQ1s")).toBe(true);
  expect(user.authenticateRecovery("l36pjDtp7TZtBqjm")).toBe(true);

  expect(user.password).toBe("xBOHdowK5e2YjQ1s");
  expect(user.recovery).toBe("l36pjDtp7TZtBqjm");
});
