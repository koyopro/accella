import { Post, PostTag } from ".";
import { $post } from "../factories/post";
import { $postTag } from "../factories/postTag";
import { $user } from "../factories/user";

describe("hasManyThrogh", () => {
  test("create", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    expect(Post.find(p.id).tags.toArray()).toEqual([]);
    p.tags.push(postTag);
    expect(Post.find(p.id).tags.map((t) => t.id)).toEqual([postTag.id]);
  });

  test("destroyAll()", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);

    expect(p.tags.destroyAll().length).toEqual(1);
    expect(p.tags.toArray()).toEqual([]);
    expect(PostTag.count()).toEqual(1);
  });

  test("deleteAll()", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);

    expect(p.tags.deleteAll().length).toEqual(1);
    expect(p.tags.toArray()).toEqual([]);
    expect(PostTag.count()).toEqual(1);
  });

  test("delete()", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);
    expect(p.tags.count()).toEqual(1);

    expect(p.tags.delete(postTag)).toBeTruthy();
    expect(p.tags.count()).toEqual(0);
    expect(PostTag.count()).toEqual(1);
  });

  test("destroy()", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);
    expect(p.tags.count()).toEqual(1);

    expect(p.tags.destroy(postTag)).toBeTruthy();
    expect(p.tags.count()).toEqual(0);
    expect(PostTag.count()).toEqual(1);
  });

  test("replace()", () => {
    const p = $post.create({ author: $user.create() });
    const t1 = $postTag.create({ name: "tag1" });
    const t2 = $postTag.create({ name: "tag2" });
    const t3 = $postTag.create({ name: "tag3" });
    p.tags.push([t1, t2]);
    expect(p.tags.count()).toEqual(2);
    p.tags.replace([t2, t3]);
    expect(p.tags.map((p) => p.name)).toEqual(["tag2", "tag3"]);
    expect(Post.find(p.id).tags.map((p) => p.name)).toEqual(["tag2", "tag3"]);
  });

  test("destroy() owner", () => {
    const p = $post.create({ author: $user.create() });
    const t1 = $postTag.create({ name: "tag1" });
    p.tags.push([t1]);
    expect(p.tags.count()).toEqual(1);
    t1.destroy();
    expect(p.tags.count()).toEqual(0);
  });

  test("push multi times", () => {
    const p = $post.create({ author: $user.create() });
    const t1 = $postTag.create({ name: "tag1" });
    const t2 = $postTag.create({ name: "tag2" });
    p.tags.push([t1, t2]);
    expect(p.tags.toArray().length).toEqual(2);
    p.tags.push(t1);
    expect(p.tags.toArray().length).toEqual(2);
  });

  describe("getter/setter types", () => {
    test("persisted & new", () => {
      const post = $post.create({ author: $user.create() });
      const tag = $postTag.build();
      expect(tag.isPersisted()).toBe(false);
      post.tags.push([tag]);
      expect(tag.isPersisted()).toBe(true);
      expect(post.tags.first()?.isPersisted()).toBe(true);
    });

    test("new & new", () => {
      const post = $post.build({ author: $user.create() });
      const tag = $postTag.build();
      post.tags.push([tag]);
      expect(post.isPersisted()).toBe(false);
      expect(tag.isPersisted()).toBe(false);

      if (!post.save()) throw new Error("Failed to save user");
      expect(post.isPersisted()).toBe(true);
      expect(tag.isPersisted()).toBe(true);
      expect(post.tags.first()?.isPersisted()).toBe(true);
    });
  });
});
