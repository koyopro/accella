import { $user } from "../factories/user";
import { Profile } from "./profile";

describe("database mapping", () => {
  test("mapping table name, default values", () => {
    const user = $user.create();

    const p1 = Profile.build({});
    expect(p1.id).toBeUndefined();
    expect(p1.point).toBeUndefined();
    expect(p1.enabled).toBeUndefined();
    expect(p1.bio).toBeUndefined();
    expect(p1.userId).toBeUndefined();
    expect(p1.role).toBeUndefined();
    if (!p1.update({ user })) {
      throw new Error("Failed to save");
    }
    const p2 = Profile.find(p1.id);
    for (const p of [p1, p2]) {
      expect(p.id).not.toBeUndefined();
      expect(p.point).toBe(100);
      expect(p.enabled).toBe(true);
      expect(p.bio).toBe("I'm a Prisma user!");
      expect(p.userId).toBe(user.id);
      expect(p.role).toBe("MEMBER");
    }
  });
});
