import { $post } from "../../factories/post";
import { $user } from "../../factories/user";
import { Post } from "../post";
import { User } from "../user";

describe("#CollectionProxy()", () => {
  test("#count()", () => {
    const posts = [
      Post.build({ title: "post1" }),
      Post.build({ title: "post2" }),
    ];
    const u = $user.create({ posts });
    expect(u.posts.count()).toBe(2);
  });
});
