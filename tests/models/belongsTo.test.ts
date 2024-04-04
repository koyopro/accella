import { Setting } from ".";
import { $post } from "../factories/post";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";

describe("BelongsTo", () => {
  test("get", () => {
    const user = $user.create({ name: "hoge" });
    const setting = $setting.create({ threshold: 0.5, userId: user.id });
    expect(setting.user.equals(user)).toBe(true);
    const post = $post.create({ authorId: user.id });
    expect(post.author.equals(user)).toBe(true);
  });

  test("set", () => {
    const user = $user.create({ name: "hoge" });

    const setting = $setting.build({ userId: undefined });
    setting.user = user;
    setting.save();
    expect(setting.userId).toBe(user.id);

    const post = $post.build({ authorId: undefined });
    post.update({ author: user });
    expect(post.authorId).toBe(user.id);
  });

  test("includes", () => {
    $setting.create({ user: $user.create() });
    $setting.create({ user: $user.create() });

    const settings = Setting.includes("user").toArray();
    const beforeCount = Setting.connection.queryCount;
    expect(settings[0].user.isNewRecord).toBe(false);
    expect(settings[1].user.isNewRecord).toBe(false);
    expect(Setting.connection.queryCount).toBe(beforeCount);
  });

  describe("getter/setter types", () => {
    test("new & persisted", () => {
      const user = $user.create();
      const setting = $setting.build();
      expect(setting.isPersisted()).toBe(false);
      setting.user = user;
      expect(setting.isPersisted()).toBe(false);
      if (!setting.save()) throw new Error("Failed to save");
      expect(setting.isPersisted()).toBe(true);
    });
  });
});
