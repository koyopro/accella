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
});
