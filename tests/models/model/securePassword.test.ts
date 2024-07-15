import { hasSecurePassword, Mix } from "accel-record-core";
import { User } from "..";
import { $user } from "../../factories/user";
import { ApplicationRecord } from "../applicationRecord";
import { withI18n } from "../../contexts/i18n";

const validPassword = "xBOHdowK5e2YjQ1s";
const validRecovery = "l36pjDtp7TZtBqjm";

test("hasSecurePassword()", () => {
  const user = $user.build({});
  user.password = "";
  user.passwordConfirmation = "";
  expect(user.save()).toBe(false);
  expect(user.errors.fullMessages).toEqual(["Password can't be blank"]);

  user.password = validPassword;
  expect(user.save()).toBe(false);
  expect(user.errors.fullMessages).toEqual([
    "PasswordConfirmation doesn't match Password",
  ]);

  user.passwordConfirmation = validPassword;
  expect(user.save()).toBe(true);
  expect(user.errors.fullMessages).toEqual([]);

  expect(user.passwordDigest).not.toBeFalsy();

  expect(user.authenticate("invalid")).toBe(false);
  expect(user.authenticate(validPassword)).toBe(true);
  expect(user.authenticatePassword(validPassword)).toBe(true);

  const u = User.find(user.id!);
  expect(u.authenticate("invalid")).toBe(false);
  expect(u.authenticate(validPassword)).toBe(true);
  expect(u.authenticatePassword(validPassword)).toBe(true);
});

test("hasSecurePassword() on create", () => {
  const password = validPassword;
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
  user.recovery = user.recoveryConfirmation = validRecovery;
  expect(user.isValid()).toBe(true);
  expect(user.authenticateRecovery(validRecovery)).toBe(true);
});

test("hasSecurePassword() multiple", () => {
  class MultiplePasswordUser extends Mix(
    ApplicationRecord,
    hasSecurePassword(),
    hasSecurePassword({ attribute: "recovery", validations: false })
  ) {}
  const user = new MultiplePasswordUser();
  user.password = user.passwordConfirmation = validPassword;
  user.recovery = user.recoveryConfirmation = validRecovery;
  expect(user.isValid()).toBe(true);
  expect(user.authenticate(validPassword)).toBe(true);
  expect(user.authenticatePassword(validPassword)).toBe(true);
  expect(user.authenticateRecovery(validRecovery)).toBe(true);

  expect(user.password).toBe(validPassword);
  expect(user.recovery).toBe(validRecovery);
});

describe("with i18n", () => {
  withI18n();

  test("hasSecurePassword() validation message", () => {
    const user = $user.build({});
    user.password = "";
    user.passwordConfirmation = "";
    expect(user.save()).toBe(false);
    expect(user.errors.fullMessages).toEqual(["パスワード を入力してください"]);

    user.password = validPassword;
    expect(user.save()).toBe(false);
    expect(user.errors.fullMessages).toEqual([
      "パスワード(確認用) とパスワードの入力が一致しません",
    ]);
  });
});
