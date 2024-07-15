import { hasSecurePassword, Mix } from "accel-record-core";
import { User } from "..";
import { $user } from "../../factories/user";
import { ApplicationRecord } from "../applicationRecord";
import { withI18n } from "../../contexts/i18n";

const validPassword = "xBOHdowK5e2YjQ1s";
const validRecovery = "l36pjDtp7TZtBqjm";

test("hasSecurePassword()", () => {
  const user = $user.build({});
  expect(user.save()).toBe(false);
  expect(user.errors.fullMessages).toEqual(["Password can't be blank"]);

  user.password = validPassword;
  user.passwordConfirmation = "";
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

test("validation on update", () => {
  const user = $user.build({});

  user.password = "a".repeat(72);
  expect(user.isValid()).toBe(true);

  user.password = "a".repeat(73);
  expect(user.isValid()).toBe(false);
  expect(user.errors.fullMessages).toEqual([
    "Password is too long (maximum is 72 characters)",
  ]);
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

test("hasSecurePassword() with validations: 'optional'", () => {
  class OptionalValidationsUser extends Mix(
    ApplicationRecord,
    hasSecurePassword({ validations: "optional" })
  ) {}
  const user = new OptionalValidationsUser();
  expect(user.isValid()).toBe(true);
  user.password = validPassword;
  // Since passwordConfirmation is undefined, the confirmation will be skipped
  expect(user.isValid()).toBe(true);
  user.passwordConfirmation = "";
  expect(user.isValid()).toBe(false);
  user.passwordConfirmation = validPassword;
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

test("password setter", () => {
  const user = User.build({});
  // not update passwordDigest
  user.password = "";
  expect(user.passwordDigest).toBeUndefined();
  // update passwordDigest
  user.password = validPassword;
  expect(user.passwordDigest).not.toBeUndefined();
  // not update passwordDigest
  user.password = "";
  expect(user.passwordDigest).not.toBeUndefined();
  // update passwordDigest
  user.password = undefined;
  expect(user.passwordDigest).toBeUndefined();
});

describe("with i18n", () => {
  withI18n();

  test("hasSecurePassword() validation message", () => {
    const user = $user.build({});
    expect(user.save()).toBe(false);
    expect(user.errors.fullMessages).toEqual(["パスワード を入力してください"]);

    user.password = validPassword;
    user.passwordConfirmation = "";
    expect(user.save()).toBe(false);
    expect(user.errors.fullMessages).toEqual([
      "パスワード(確認用) とパスワードの入力が一致しません",
    ]);
  });
});
