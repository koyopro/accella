import { $user } from "../factories/user";
import { Profile } from "./profile";

describe("database mapping", () => {
  test("mapping table name", () => {
    const user = $user.create();
    const p = Profile.create({ user: user });
    expect(p.point).toBe(100);
    expect(p.enabled).toBe(true);
    // expect(p.bio).toBe("I'm a Prisma user!");
  });
});
