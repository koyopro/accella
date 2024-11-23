import { $user } from "../factories/user";
import { Profile } from "./index";

const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("database mapping", () => {
  test("mapping table name, default values", () => {
    const user = $user.create();

    const p1 = Profile.build({});
    expect(p1.id).toBeUndefined();
    expect(p1.point).toBe(100);
    expect(p1.enabled).toBe(true);
    expect(p1.bio).toBe("I'm a Prisma user!");
    expect(p1.role).toBe("MEMBER");
    // expect(p1.createdAt).toBeUndefined();
    expect(p1.userId).toBeUndefined();
    expect(p1.uuid).not.toBeUndefined();
    expect(p1.cuid).not.toBeUndefined();
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
      // expect(p.createdAt).not.toBeUndefined();
      expect(p.uuid).not.toBeUndefined();
      expect(p.cuid).not.toBeUndefined();
    }
  });

  test("uuid version", () => {
    const p = Profile.build({});
    expect(p.uuid).toMatch(uuidV4Pattern);
    expect(p.uuid7).toMatch(uuidV7Pattern);
  });
});
