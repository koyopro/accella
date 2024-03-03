import { User } from "./user";

describe("Columns", () => {
  test("createdAt", () => {
    const u = User.build({ email: "hoge@example.com" });
    expect(u.createdAt).toBeUndefined();
    if (!u.save()) {
      throw new Error("Failed to save");
    }
    // 数秒のズレは許容する
    expect(u.createdAt.getTime() / 10000).toBeCloseTo(Date.now() / 10000, 0);
  });

  test("updatedAt", () => {
    const u = User.create({ email: "aaa@example.com" });
    // 数秒のズレは許容する
    expect(u.updatedAt.getTime() / 10000).toBeCloseTo(Date.now() / 10000, 0);

    const oldTime = new Date(2020, 1, 1);
    const u2 = User.create({
      name: "hoge",
      email: "hoge@example.com",
      updatedAt: oldTime,
    });
    expect(u2.updatedAt.getTime() / 10000).toBeCloseTo(
      oldTime.getTime() / 10000,
      0
    );
    u2.update({ name: "fuga" });
    expect(u2.updatedAt.getTime() / 10000).toBeCloseTo(Date.now() / 10000, 0);
  });
});
