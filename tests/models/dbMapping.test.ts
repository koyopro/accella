import { $user } from "../factories/user";
import { Profile } from "./index";

describe("database mapping", () => {
  test("mapping table name, default values", () => {
    const user = $user.create();

    const p1 = Profile.build({});
    expect(p1.id).toBeUndefined();
    expect(p1.point).toBe(100);
    expect(p1.enabled).toBe(true);
    expect(p1.bio).toBe("I'm a Prisma user!");
    expect(p1.role).toBe("MEMBER");
    expect(p1.userId).toBeUndefined();
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
