import { User } from "..";
import { $user } from "../../factories/user";

test("hasSecurePassword()", () => {
  const user = $user.build({ name: "david" });
  user.password = "";
  user.passwordConfirmation = "nomatch";
  expect(user.save()).toBe(false); // password required
  user.password = "mUc3m00RsqyRe";
  expect(user.save()).toBe(false); // confirmation doesn't match
  user.passwordConfirmation = "mUc3m00RsqyRe";
  expect(user.save()).toBe(true);
  // user.recovery_password = "42password"
  // user.recovery_password_digest                              #=> "$2a$04$iOfhwahFymCs5weB3BNH/uXkTG65HR.qpW.bNhEjFP3ftli3o5DQC"
  // user.save                                                  #=> true

  expect(user.authenticate("notright")).toBe(false);
  expect(user.authenticate("mUc3m00RsqyRe")).toBe(user);

  User.findBy({ name: "david" })?.authenticate("notright"); //=> false
  User.findBy({ name: "david" })?.authenticate("mUc3m00RsqyRe"); //=> user
});
