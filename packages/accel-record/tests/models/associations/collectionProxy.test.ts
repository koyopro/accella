import { $post } from "../../factories/post";
import { $user } from "../../factories/user";
import { Post } from "../post";
import { User } from "../user";

describe("#CollectionProxy()", () => {
  test("#toArray()", () => {
    const posts = [
      Post.build({ title: "post1" }),
      Post.build({ title: "post2" }),
    ];
    const u = $user.build({ posts });
    expect(u.posts.toArray()).toEqual(posts);
    u.save();

    const u2 = User.find(u.id!);
    expect(u2.posts.toArray().map((p) => p.title)).toEqual(["post1", "post2"]);
  });

  test("#count()", () => {
    const u1 = $user.create({});
    // const u2 = $user.create({});
    $post.create({ title: "post1", authorId: u1.id });
    $post.create({ title: "post2", authorId: u1.id });
    $post.create({ title: "post3", authorId: u1.id });
    expect(Post.count()).toBe(3);
    expect(u1.posts.count()).toBe(3);
    // expect(u2.posts.count()).toBe(2);
  });
});
