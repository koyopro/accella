import { $user } from "../factories/user";
import { Profile } from "./profile";
import { User } from "./user";

describe("database mapping", () => {
  test("mapping table name", () => {
    const user = $user.create();
    const p = Profile.create({ user: user });
  });
});
