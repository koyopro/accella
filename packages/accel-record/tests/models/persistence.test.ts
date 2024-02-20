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

  test("#delete()", () => {
    const u = $user.create();
    expect(User.count()).toBe(1);
    expect(u.delete()).toBe(true);
    expect(User.count()).toBe(0);
  });
});
