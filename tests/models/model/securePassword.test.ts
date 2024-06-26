import { hasSecurePassword, Mix } from "accel-record-core";
import { User } from "..";
import { $user } from "../../factories/user";
import { ApplicationRecord } from "../applicationRecord";

test("hasSecurePassword()", () => {
  const user = $user.build({ name: "david" });
  user.password = "";
  user.passwordConfirmation = "nomatch";
  expect(user.save()).toBe(false); // password required
  user.password = "mUc3m00RsqyRe";
  expect(user.save()).toBe(false); // confirmation doesn't match
  user.passwordConfirmation = "mUc3m00RsqyRe";
  expect(user.save()).toBe(true);

  expect(user.passwordDigest).not.toBeUndefined();
  // user.recovery_password = "42password"
  // user.recovery_password_digest                              #=> "$2a$04$iOfhwahFymCs5weB3BNH/uXkTG65HR.qpW.bNhEjFP3ftli3o5DQC"
  // user.save                                                  #=> true

  expect(user.authenticate("notright")).toBe(false);
  expect(user.authenticate("mUc3m00RsqyRe")).toBe(true);

  const u = User.find(user.id!);
  expect(u.authenticate("notright")).toBe(false);
  expect(u.authenticate("mUc3m00RsqyRe")).toBe(true);

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
  user.recovery = user.recoveryConfirmation = "mUc3m00RsqyRe";
  expect(user.isValid()).toBe(true);
});
