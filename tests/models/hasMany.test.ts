import { User, UserTeam } from ".";
import { $post } from "../factories/post";
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

  test("deleteAll()", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.deleteAll().length).toEqual(1);
    expect(user.teams.toArray()).toEqual([]);
  });

  test("push multi times", () => {
    const user = $user.create();
    const post1 = $post.build();
    const post2 = $post.build();
    user.posts.push([post1, post2]);
    expect(user.posts.toArray().length).toEqual(2);
    expect(post1.isPersisted()).toBe(true);
    user.posts.push(post1);
    expect(user.posts.toArray().length).toEqual(3);
    expect(user.reload().posts.toArray().length).toEqual(2);
  });

  test("push with validation error", () => {
    const user = $user.create();
    const post = $post.build({ title: "" });
    user.posts.push(post);
    expect(user.posts.toArray().length).toEqual(0);
    expect(post.isPersisted()).toBe(false);
    expect(post.isValid()).toBe(false);
  });

  test("includes", () => {
    $user.create({ posts: [$post.build()] });

    const baseCount = User.connection.queryCount;
    const user = User.includes("posts").first()!;
    expect(User.connection.queryCount - baseCount).toBe(2);

    const beforeCount = User.connection.queryCount;
    expect(user.posts.toArray().length).toBe(1);
    expect(User.connection.queryCount).toBe(beforeCount);
  });

  describe("getter/setter types", () => {
    test("persisted & new", () => {
      const user = $user.create();
      const post = $post.build();
      expect(post.isPersisted()).toBe(false);
      user.posts.push(post);
      expect(post.isPersisted()).toBe(true);
      expect(user.posts.first()?.isPersisted()).toBe(true);
    });

    test("new & new", () => {
      const user = $user.build();
      const post = $post.build();
      user.posts.push(post);
      expect(user.isPersisted()).toBe(false);
      expect(post.isPersisted()).toBe(false);

      if (!user.save()) throw new Error("Failed to save user");
      expect(user.isPersisted()).toBe(true);
      expect(post.isPersisted()).toBe(true);
      expect(user.posts.first()?.isPersisted()).toBe(true);
    });
  });
});
