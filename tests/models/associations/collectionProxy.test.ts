import { Post, User } from "..";
import { $post } from "../../factories/post";
import { $user } from "../../factories/user";

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
    const u2 = $user.create({});
    $post.create({ title: "post1", authorId: u1.id });
    $post.create({ title: "post2", authorId: u1.id });
    $post.create({ title: "post3", authorId: u2.id });
    expect(Post.count()).toBe(3);
    expect(u1.posts.count()).toBe(2);
    expect(u2.posts.count()).toBe(1);
  });

  test("push()", () => {
    const u = $user.create({});
    expect(u.posts.toArray()).toHaveLength(0);
    const p = $post.build({ authorId: undefined });
    const posts = u.posts.push(p);
    expect(posts.toArray()).toHaveLength(1);
  });

  test("concat()", () => {
    const u = $user.create({
      posts: [$post.build({ title: "post1", authorId: undefined })],
    });
    expect(u.posts.toArray()).toHaveLength(1);
    u.posts.concat([$post.build({ title: "post2", authorId: undefined })]);
    expect(u.posts.toArray()).toHaveLength(2);
    expect(u.posts.map((p) => p.title)).toEqual(["post1", "post2"]);
  });

  test("#deleteAll()", () => {
    const u = $user.create({
      posts: [
        $post.build({ title: "post1", authorId: undefined }),
        $post.build({ title: "post2", authorId: undefined }),
      ],
    });
    expect(u.posts.toArray()).toHaveLength(2);
    expect(u.posts.deleteAll()).toHaveLength(2);
    expect(u.posts.toArray()).toHaveLength(0);
  });

  test("#destroyAll()", () => {
    const u = $user.create({
      posts: [
        $post.build({ title: "post1", authorId: undefined }),
        $post.build({ title: "post2", authorId: undefined }),
      ],
    });
    expect(u.posts.toArray()).toHaveLength(2);
    expect(u.posts.destroyAll()).toHaveLength(2);
    expect(u.posts.toArray()).toHaveLength(0);
  });

  test("#delete()", () => {
    const u = $user.create({});
    const p1 = $post.create({ title: "post1", authorId: u.id });
    const p2 = $post.create({ title: "post2", authorId: u.id });
    expect(u.posts.toArray()).toHaveLength(2);
    expect(u.posts.delete(p1)).toHaveLength(1);
    expect(u.posts.toArray()).toHaveLength(1);
  });

  test("#destroy()", () => {
    const u = $user.create({});
    const p1 = $post.create({ title: "post1", authorId: u.id });
    const p2 = $post.create({ title: "post2", authorId: u.id });
    expect(u.posts.toArray()).toHaveLength(2);
    expect(u.posts.destroy(p1)).toHaveLength(1);
    expect(u.posts.toArray()).toHaveLength(1);
  });

  test("#replace()", () => {
    const u = $user.create({});
    const p1 = $post.create({ title: "post1", authorId: u.id });
    const p2 = $post.create({ title: "post2", authorId: u.id });
    expect(u.posts.toArray()).toHaveLength(2);
    const p3 = $post.build({ title: "post3", authorId: undefined });
    u.posts.replace([p2, p3]);
    expect(u.posts.map((p) => p.title)).toEqual(["post2", "post3"]);
  });
});
