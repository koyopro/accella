import { $user } from "../factories/user";
import { Post } from "./post";

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
});
