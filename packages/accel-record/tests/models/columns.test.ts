import { User } from "./user";

describe("Columns", () => {
  test("createdAt", () => {
    const u = User.build({ email: "hoge@example.com" });
    expect(u.createdAt).toBeUndefined();
    if (!u.save()) {
      throw new Error("Failed to save");
    }
    expect(u.createdAt.getTime()).toBeCloseTo(Date.now(), -4);
  });

  test("updatedAt", () => {
    const u = User.create({ email: "aaa@example.com" });
    expect(u.updatedAt.getTime()).toBeCloseTo(Date.now(), -4);

    const oldTime = new Date(2020, 1, 1);
    const u2 = User.create({
      name: "hoge",
      email: "hoge@example.com",
      updatedAt: oldTime,
    });
    expect(u2.updatedAt.getTime()).toBeCloseTo(oldTime.getTime(), -4);
    u2.update({ name: "fuga" });
    expect(u2.updatedAt.getTime()).toBeCloseTo(Date.now(), -4);
  });
});
