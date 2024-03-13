import { Post, PostTag, UserTeam } from ".";
import { $post } from "../factories/post";
import { $postTag } from "../factories/postTag";
import { $team } from "../factories/team";
import { $user } from "../factories/user";

describe("ManyToMany", () => {
  test("create", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.first()?.team?.equals(team)).toBeTruthy();
    expect(team.users.first()?.user?.equals(user)).toBeTruthy();
  });

  test("create Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    expect(Post.find(p.id).tags.toArray()).toEqual([]);
    p.tags.push(postTag);
    expect(Post.find(p.id).tags.map((t) => t.id)).toEqual([postTag.id]);
  });

  test("deleteAll()", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.deleteAll().length).toEqual(1);
    expect(user.teams.toArray()).toEqual([]);
  });

  test("destroyAll() Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);

    expect(p.tags.destroyAll().length).toEqual(1);
    expect(p.tags.toArray()).toEqual([]);
    expect(PostTag.count()).toEqual(1);
  });

  test("deleteAll() Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);

    expect(p.tags.deleteAll().length).toEqual(1);
    expect(p.tags.toArray()).toEqual([]);
    expect(PostTag.count()).toEqual(1);
  });

  test("delete() Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);
    expect(p.tags.count()).toEqual(1);

    expect(p.tags.delete(postTag)).toBeTruthy();
    expect(p.tags.count()).toEqual(0);
    expect(PostTag.count()).toEqual(1);
  });

  test("destroy() Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);
    expect(p.tags.count()).toEqual(1);

    expect(p.tags.destroy(postTag)).toBeTruthy();
    expect(p.tags.count()).toEqual(0);
    expect(PostTag.count()).toEqual(1);
  });

  test("replace() Implicit", () => {
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
});
