import { hasSecurePassword, Mix } from "accel-record-core";
import { Account } from "..";
import { withI18n } from "../../contexts/i18n";
import { $Account } from "../../factories/account";
import { ApplicationRecord } from "../applicationRecord";

const validPassword = "xBOHdowK5e2YjQ1s";
const validRecovery = "l36pjDtp7TZtBqjm";

test("hasSecurePassword()", () => {
  const account = $Account.build({});
  account.password = undefined;
  expect(account.save()).toBe(false);
  expect(account.errors.fullMessages).toEqual(["Password can't be blank"]);

  account.password = validPassword;
  account.passwordConfirmation = "";
  expect(account.save()).toBe(false);
  expect(account.errors.fullMessages).toEqual([
    "PasswordConfirmation doesn't match Password",
  ]);

  account.passwordConfirmation = validPassword;
  expect(account.save()).toBe(true);
  expect(account.errors.fullMessages).toEqual([]);

  expect(account.passwordDigest).not.toBeFalsy();

  expect(account.authenticate("invalid")).toBe(false);
  expect(account.authenticate(validPassword)).toBe(true);
  expect(account.authenticatePassword(validPassword)).toBe(true);

  const u = Account.find(account.id!);
  expect(u.authenticate("invalid")).toBe(false);
  expect(u.authenticate(validPassword)).toBe(true);
  expect(u.authenticatePassword(validPassword)).toBe(true);
});

test("hasSecurePassword() on create", () => {
  const password = validPassword;
  const account = $Account.build({
    password: password,
    passwordConfirmation: password,
  });
  expect(account.passwordDigest).not.toBeUndefined();
  expect(account.save()).toBe(true);
});

test("validation on update", () => {
  const account = $Account.build({});

  account.password = "a".repeat(72);
  expect(account.isValid()).toBe(true);

  account.password = "a".repeat(73);
  expect(account.isValid()).toBe(false);
  expect(account.errors.fullMessages).toEqual([
    "Password is too long (maximum is 72 characters)",
  ]);
});

test("hasSecurePassword() with validations: false", () => {
  class NoValidationsaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword({ validations: false })
  ) {}
  const account = new NoValidationsaccount();
  account.passwordConfirmation = "nomatch";
  expect(account.isValid()).toBe(true);
});

test("hasSecurePassword() with validations: 'optional'", () => {
  class OptionalValidationsaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword({ validations: "optional" })
  ) {}
  const account = new OptionalValidationsaccount();
  expect(account.isValid()).toBe(true);
  account.password = validPassword;
  // Since passwordConfirmation is undefined, the confirmation will be skipped
  expect(account.isValid()).toBe(true);
  account.passwordConfirmation = "";
  expect(account.isValid()).toBe(false);
  account.passwordConfirmation = validPassword;
  expect(account.isValid()).toBe(true);
});

test("hasSecurePassword() with custom attribute", () => {
  class CustomAttributeaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword({ attribute: "recovery" })
  ) {}
  const account = new CustomAttributeaccount();
  account.recovery = account.recoveryConfirmation = validRecovery;
  expect(account.isValid()).toBe(true);
  expect(account.authenticateRecovery(validRecovery)).toBe(true);
});

test("hasSecurePassword() multiple", () => {
  class MultiplePasswordaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword(),
    hasSecurePassword({ attribute: "recovery", validations: false })
  ) {}
  const account = new MultiplePasswordaccount();
  account.password = account.passwordConfirmation = validPassword;
  account.recovery = account.recoveryConfirmation = validRecovery;
  expect(account.isValid()).toBe(true);
  expect(account.authenticate(validPassword)).toBe(true);
  expect(account.authenticatePassword(validPassword)).toBe(true);
  expect(account.authenticateRecovery(validRecovery)).toBe(true);

  expect(account.password).toBe(validPassword);
  expect(account.recovery).toBe(validRecovery);
});

test("password setter", () => {
  const account = Account.build({});
  // not update passwordDigest
  account.password = "";
  expect(account.passwordDigest).toBeUndefined();
  // update passwordDigest
  account.password = validPassword;
  expect(account.passwordDigest).not.toBeUndefined();
  // not update passwordDigest
  account.password = "";
  expect(account.passwordDigest).not.toBeUndefined();
  // update passwordDigest
  account.password = undefined;
  expect(account.passwordDigest).toBeUndefined();
});

describe("with i18n", () => {
  withI18n();

  test("hasSecurePassword() validation message", () => {
    const account = $Account.build({});
    account.password = undefined;
    expect(account.save()).toBe(false);
    expect(account.errors.fullMessages).toEqual([
      "パスワード を入力してください",
    ]);

    account.password = validPassword;
    account.passwordConfirmation = "";
    expect(account.save()).toBe(false);
    expect(account.errors.fullMessages).toEqual([
      "パスワード(確認用) とパスワードの入力が一致しません",
    ]);
  });
});
