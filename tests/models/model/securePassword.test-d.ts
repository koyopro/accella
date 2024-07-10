import { hasSecurePassword, Mix } from "accel-record-core";
import { $user } from "../../factories/user";
import { ApplicationRecord } from "../applicationRecord";

test("hasSecurePassword()", () => {
  const user = $user.create();
  user.password = "";
  user.passwordConfirmation = "";
  expectTypeOf(user.authenticate("")).toBeBoolean();
  expectTypeOf(user.authenticatePassword("")).toBeBoolean();

  // @ts-expect-error
  user.hoge;
});

test("hasSecurePassword() with custom attribute", () => {
  class CustomAttributeUser extends Mix(
    ApplicationRecord,
    hasSecurePassword({ attribute: "recovery" })
  ) {}
  const user = new CustomAttributeUser();
  user.recovery = "";
  user.recoveryConfirmation = "";
  expectTypeOf(user.authenticateRecovery("")).toBeBoolean();
  // @ts-expect-error
  user.authenticate("");
  // @ts-expect-error
  user.authenticatePassword("");
});

test("hasSecurePassword() multiple", () => {
  class MultiplePasswordUser extends Mix(
    ApplicationRecord,
    hasSecurePassword(),
    hasSecurePassword({ attribute: "recovery", validations: false })
  ) {}
  const user = new MultiplePasswordUser();
  user.password = "";
  user.passwordConfirmation = "";
  user.recovery = "";
  user.recoveryConfirmation = "";
  expectTypeOf(user.authenticate("")).toBeBoolean();
  expectTypeOf(user.authenticatePassword("")).toBeBoolean();
  expectTypeOf(user.authenticateRecovery("")).toBeBoolean();
});
