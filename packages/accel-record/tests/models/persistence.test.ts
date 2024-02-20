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
  });

  test("#update()", () => {
    const u = $user.create({ name: "hoge" });
    expect(u.update({ name: "fuga" })).toBe(true);
    expect(u.name).toBe('fuga');
    expect(User.all().get()[0].name).toBe("fuga");
  });

  test("#delete()", () => {
    const u = $user.create();
    expect(User.count()).toBe(1);
    expect(u.delete()).toBe(true);
    expect(User.count()).toBe(0);
  });
});
