import { $user } from "../../factories/user";
import { User } from "../_types";

test(".lock()", () => {
  $user.create({ id: 1, name: "foo" });
  const u = User.lock().find(1);
  expect(u.name).toBe("foo");

  User.lock("forShare").find(1);
});

test("#lock()", () => {
  const user = $user.create({ id: 1, name: "foo" });
  user.lock();

  user.lock("forShare");
});
