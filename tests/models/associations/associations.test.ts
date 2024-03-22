import { $setting } from "../../factories/setting";
import { $user } from "../../factories/user";

test("#assotiations", () => {
  const u = $user.create({});
  expect(u.associations.get("posts")).toBeDefined();
  expect(u.associations.get("setting")).toBeDefined();

  const setting = $setting.create({ user: u });
  expect(setting.associations.get("user")).toBeDefined();
});
