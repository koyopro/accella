import { $post } from "../factories/post";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Setting } from "./setting";

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
    // Confirm: that N+1 queries are not occurring
    const settings = Setting.includes("user").toArray();
    expect(settings[0].user.isNewRecord).toBe(false);
    expect(settings[1].user.isNewRecord).toBe(false);
  });
});
