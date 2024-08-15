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

test("#withLock()", () => {
  const user = $user.create({ id: 1, name: "foo" });
  {
    const r = user.withLock(() => user.update({ name: "bar" }));
    expect(r).toBeTruthy();
    expect(user.name).toBe("bar");
  }
  {
    const r = user.withLock("forShare", () => user.update({ name: "baz" }));
    expect(r).toBeTruthy();
    expect(user.name).toBe("baz");
  }
});
