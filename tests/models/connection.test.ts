import { Model } from "accel-record";
import { $user } from "../factories/user";
import { User } from "./user";

test("execute", () => {
  const u = $user.create({ name: "hoge" });
  Model.connection.execute("update User set name = 'fuga' where id = ?", [
    u.id,
  ]);
  expect(User.find(u.id)!.name).toBe("fuga");
});
