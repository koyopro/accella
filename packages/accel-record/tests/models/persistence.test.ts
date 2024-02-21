import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { Post } from "./post";
import { User } from "./user";

describe("Persistence", () => {
  test("#save()", () => {
    const posts = [
      Post.build({ title: "post1" }),
      Post.build({ title: "post2" }),
    ];
    const u = $user.build({ posts });
    expect(u.save()).toBe(true);
    expect(Post.all().get()).toHaveLength(2);

    u.isReadonly = true;
    expect(() => u.save()).toThrowError("Readonly record");
  });

  test("#update()", () => {
    const u = $user.create({ name: "hoge" });
    expect(u.update({ name: "fuga" })).toBe(true);
    expect(u.name).toBe("fuga");
    expect(User.all().get()[0].name).toBe("fuga");
  });

  test("#delete()", () => {
    const u = $user.create();
    expect(u.isReadonly).toBe(false);
    expect(u.isDestroyed).toBe(false);
    expect(User.count()).toBe(1);

    expect(u.delete()).toBe(true);

    expect(u.isReadonly).toBe(true);
    expect(u.isDestroyed).toBe(true);
    expect(User.count()).toBe(0);
  });

  test("#destroy()", () => {
    const p = $post.build();
    const u = $user.create({ posts: [p] });
    expect(u.isReadonly).toBe(false);
    expect(u.isDestroyed).toBe(false);
    expect(User.count()).toBe(1);
    expect(Post.count()).toBe(1);

    expect(u.destroy()).toBe(true);

    expect(u.isReadonly).toBe(true);
    expect(u.isDestroyed).toBe(true);
    expect(User.count()).toBe(0);
    expect(Post.count()).toBe(0);
  });
});
