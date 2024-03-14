import { UserTeam } from ".";
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
