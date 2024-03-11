import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Setting } from "./setting";
import { User } from "./user";

describe("Columns", () => {
  test("createdAt", () => {
    const u = User.build({ email: "hoge@example.com" });
    expect(u.createdAt).toBeUndefined();
    if (!u.save()) {
      throw new Error("Failed to save");
    }
    expect(u.createdAt.getTime()).toBeCloseTo(Date.now(), -4);
    expect(u.createdAt).toEqual(u.updatedAt);
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

  test("retrive auto increment column", () => {
    const s = $setting.create({ user: $user.create() });
    expect(s.settingId).not.toBeUndefined();
  });

  test("json column", () => {
    expect(Setting.build({}).data).toEqual({ key1: "hoge" });
    $setting.create({
      user: $user.create(),
      data: { key1: "value1", key2: { key3: 3 } },
    });
    const s = Setting.first();
    expect(s.data.key1).toBe("value1");
    expect(s.data.key2?.key3).toBe(3);
  });
});
