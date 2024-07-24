import { hasSecurePassword, Mix } from "accel-record-core";
import { Account } from "..";
import { ApplicationRecord } from "../applicationRecord";

test("hasSecurePassword()", () => {
  // Ensure that passwordDigest is not required
  const account = Account.create({
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  expectTypeOf(account.authenticate("")).toBeBoolean();
  expectTypeOf(account.authenticatePassword("")).toBeBoolean();

  // @ts-expect-error
  account.hoge;
});

test("hasSecurePassword() with custom attribute", () => {
  class CustomAttributeaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword({ attribute: "recovery" })
  ) {}
  const account = new CustomAttributeaccount();
  account.recovery = "";
  account.recoveryConfirmation = "";
  expectTypeOf(account.authenticateRecovery("")).toBeBoolean();
  // @ts-expect-error
  account.authenticate("");
  // @ts-expect-error
  account.authenticatePassword("");
});

test("hasSecurePassword() multiple", () => {
  class MultiplePasswordaccount extends Mix(
    ApplicationRecord,
    hasSecurePassword(),
    hasSecurePassword({ attribute: "recovery", validations: false })
  ) {}
  const account = new MultiplePasswordaccount();
  account.password = "";
  account.passwordConfirmation = "";
  account.recovery = "";
  account.recoveryConfirmation = "";
  expectTypeOf(account.authenticate("")).toBeBoolean();
  expectTypeOf(account.authenticatePassword("")).toBeBoolean();
  expectTypeOf(account.authenticateRecovery("")).toBeBoolean();
});
